import { useState, useRef, useEffect } from 'react';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';

import { makeStyles } from '@mui/styles';

import {Buffer} from 'buffer';

import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkXMLPolyDataReader from '@kitware/vtk.js/IO/XML/XMLPolyDataReader';
import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkScalarBarActor from '@kitware/vtk.js/Rendering/Core/ScalarBarActor';
import debounce from "lodash/debounce";
import { lightTheme, darkTheme } from './../../../theme';
import hexRgb from 'hex-rgb';
import { trackPromise, usePromiseTracker } from "react-promise-tracker";
import Loader from 'react-promise-loader';
import { initializeApp } from '@firebase/app';
import { getBlob, getStorage, ref, getDownloadURL } from "@firebase/storage";
import rom from 'rom'
import Papa from 'papaparse'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'

import { environment } from './../../../../environments/environment';

const { ColorMode } = vtkMapper;

const data_source = "local" //  local | remote

function temperatureToViscosity(T) {
  const a0 = 1.145757;
  const a1 = 0.005236;
  const a2 = 1.952*1e-06;

  return a0+a1*T+a2*Math.pow(T,2);
}

function setScene(data, context, vtkContainerRef, theme) {
      const { reduced } = context.current;
      const reader = vtkXMLPolyDataReader.newInstance();
      const actor = vtkActor.newInstance();
      const scalarBarActor = vtkScalarBarActor.newInstance();
      const lookupTable = vtkColorTransferFunction.newInstance();
      const mapper = vtkMapper.newInstance({
        interpolateScalarsBeforeMapping: true,
        colorByArrayName: "uRec",
        colorMode: ColorMode.DEFAULT,
        scalarMode: 'pointData',
        useLookupTableScalarRange: true,
        lookupTable,
      });
      actor.setMapper(mapper);
      mapper.setLookupTable(lookupTable);
      scalarBarActor.setVisibility(true);
      const mystyle = {
        margin: '0',
        padding: '0',
        paddingBottom: '50',
        position: 'absolute',
        top: '0',
        left: '0',
        width: '99%',
        height: '93%',
        overflow: 'hidden',
      };
      const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
        containerStyle: mystyle,
        background, 
        rootContainer: vtkContainerRef.current,
      });
      const renderer = fullScreenRenderer.getRenderer();
      const renderWindow = fullScreenRenderer.getRenderWindow();
      const preset = vtkColorMaps.getPresetByName('erdc_rainbow_bright');
      lookupTable.setVectorModeToMagnitude();
      lookupTable.applyColorMap(preset);
      lookupTable.updateRange();

      const scalarBarActorStyle = {
        paddingBottom: 30,
        fontColor: theme.vtkText.color,
        fontStyle: 'normal',
        fontFamily: theme.vtkText.fontFamily
      };
          reduced.readUnstructuredGrid(data);
          reduced.solveOnline(new rom.Matrix([initialVelocity]));
          const polydata_string = reduced.unstructuredGridToPolyData();
          // TODO: parse directly as buffer or parse as a string...
          var buf = Buffer.from(polydata_string, 'utf-8');	
          reader.parseAsArrayBuffer(buf);
          let polydata = reader.getOutputData(0);

          renderer.addActor(scalarBarActor);
          renderer.addActor(actor);

          reduced.nu(temperatureToViscosity(initialTemperature)*1e-05);
          const newU = reduced.reconstruct();

          var nCells = polydata.getNumberOfPoints();
          polydata.getPointData().setActiveScalars("uRec");

          const array = vtkDataArray.newInstance({ name: 'uRec', size: nCells*3, numberOfComponents: 3, dataType: 'Float32Array' });
          for (let i = 0; i < nCells; i++) {
            let v =[newU[i], newU[i + nCells], newU[i + nCells * 2]];
            array.setTuple(i, v)
          }
          array.modified();
          array.modified();

          polydata.getPointData().addArray(array);

          var activeArray = polydata.getPointData().getArray("uRec");
          const dataRange = [].concat(activeArray ? activeArray.getRange() : [0, 1]);
          lookupTable.setMappingRange(dataRange[0], dataRange[1]);
          lookupTable.updateRange();
          mapper.setScalarModeToUsePointFieldData();
          mapper.setScalarRange(dataRange[0],dataRange[1]);
          mapper.setColorByArrayName('uRec');
          mapper.setInputData(polydata);
          scalarBarActor.setScalarsToColors(mapper.getLookupTable());
          scalarBarActor.setAxisLabel("Velocity magnitude (m/s)");
          lookupTable.updateRange();
          scalarBarActor.modified();
          renderer.resetCamera();
          renderer.getActiveCamera().zoom(1.3);
          renderWindow.render();
          renderer.resetCameraClippingRange();
          scalarBarActor.modified();
          //scalarBarActor.setVisibility(false);
          renderWindow.render();
          renderWindow.modified();

          scalarBarActor.setAxisTextStyle(scalarBarActorStyle);
          scalarBarActor.setTickTextStyle(scalarBarActorStyle);
          scalarBarActor.modified();
          scalarBarActor.update();		
          scalarBarActor.updatePolyDataForLabels();		
          scalarBarActor.updateTextureAtlas();		
          //scalarBarActor.setVisibility(true);
          renderWindow.render();

          const camera = renderer.getActiveCamera();
          const focalPoint = [].concat(camera ? camera.getFocalPoint() : [0, 1, 2]);
          const cameraPosition = [].concat(camera ? camera.getPosition() : [0, 1, 2]);

          context.current = {
            focalPoint,
            cameraPosition,
            reduced,
            reader,
            fullScreenRenderer,
            renderWindow,
            renderer,
            lookupTable,
            polydata,
            actor,
            scalarBarActor,
            mapper,
          };
}

// Initialize Firebase
const app = initializeApp(environment.firebaseConfig);
const storage = getStorage(app);

var background = [255, 255, 255];
var textColor = [0, 0, 0];

const initialTemperature = 20; // 1e-05
const initialVelocity = 10.0;
const dataPath = '/OpenFOAM/incompressible/simpleFoam/pitzDaily/';
const testRef = ref(storage, 'OpenFOAM/incompressible/simpleFoam/pitzDaily/pitzDaily.vtp');

const readMatrixFile = async (storage, filePath) => {

  if (data_source === "remote")
  {
    return new Promise(resolve => {
      fetch(filePath).then(res => res.text())
      .then((data) => {
        Papa.parse(data, {
          download: false,
          delimiter: " ",
          dynamicTyping: true,
          skipEmptyLines: true,
          header: false,
          complete: results => {
            resolve(results.data);
          }
        })
     })
    })
  }
  else
  {
    const refPath = ref(storage, filePath);
    return new Promise(resolve => {
      getBlob(refPath).then((data) => {
        Papa.parse(data, {
          download: true,
          delimiter: " ",
          dynamicTyping: true,
          skipEmptyLines: true,
          header: false,
          complete: results => {
            resolve(results.data);
          }
        });
     });
    });
  }
};

function PitzDaily() {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);
  const [temperatureValue, setTemperatureValue] = useState(null);
  const [velocityValue, setVelocityValue] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(null);

  const localTheme = window.localStorage.getItem('theme')
  const testVar = useState(window.localStorage.getItem('theme'));
  const theme = localTheme === 'light' ? lightTheme : darkTheme;
  const useStyles = makeStyles(theme);
  const classes = useStyles();

  let backgroundLight = hexRgb(lightTheme.body, {format: 'array'});
  let backgroundDark = hexRgb(darkTheme.body, {format: 'array'});
  backgroundLight = backgroundLight.map(x => x / 255); 
  backgroundDark = backgroundDark.map(x => x / 255); 
  backgroundLight.pop();
  backgroundDark.pop();

  let textColorLight = lightTheme.vtkText.color;
  let textColorDark = darkTheme.vtkText.color;

  background = hexRgb(theme.body, {format: 'array'});
  textColor = hexRgb(theme.text, {format: 'array'});
  background = background.map(x => x / 255); 
  textColor = textColor.map(x => x / 255); 
  background.pop();
  textColor.pop();

  useEffect(() => {
    document.title = "cfd.xyz | OpenFOAM/incompressible/simpleFoam/pitzDaily"
  }, []);

  useEffect(() => {
    if (context.current) {

      let vtuPath = dataPath + 'pitzDaily.vtu';

      if (data_source === "local")
      {
        fetch(vtuPath).then(res => res.text())
        .then((data) => {
          setScene(data, context, vtkContainerRef, theme);
        });
      }
      else if (data_source === "remote")
      {
        vtuPath = ref(storage, vtuPath, vtkContainerRef, theme);

        getDownloadURL(vtuPath).then((url) => {
          const xhr = new XMLHttpRequest();
          xhr.responseType = 'text';
          xhr.onload = (event) => {
            const data = xhr.responseText;
            setScene(data, context, vtkContainerRef, theme);
          };
          xhr.open('GET', url);
          xhr.send();
        });
      }
      else
      {
      }
    }
  }, [dataLoaded]);

  let switch_storage = false;

  const initialize = async() => {
    setVelocityValue(initialVelocity);
    setTemperatureValue(initialTemperature);

    await getDownloadURL(testRef)
    .then((url) => {
    })
    .catch((error) => {
      switch (error.code) {
        case 'storage/quota-exceeded':
          switch_storage = true;
          break;
        default:
          break;
      }
    });

    await rom.ready

    const P = new rom.Matrix(await readMatrixFile(storage, dataPath + 'matrices/P_mat.txt'));
    const M = new rom.Matrix(await readMatrixFile(storage, dataPath + 'matrices/M_mat.txt'));
    const K = new rom.Matrix(await readMatrixFile(storage, dataPath + 'matrices/K_mat.txt'));
    const B = new rom.Matrix(await readMatrixFile(storage, dataPath + 'matrices/B_mat.txt'));
    const modes = new rom.Matrix(await readMatrixFile(storage, dataPath + 'EigenModes_U_mat.txt'));
    // Only needed for turbulent cases
    const coeffL2 = new rom.Matrix(await readMatrixFile(storage, dataPath + 'matrices/coeffL2_mat.txt'));
    const mu = new rom.Matrix(await readMatrixFile(storage, dataPath + 'par'));
    const Nphi_u = B.rows();
    const Nphi_p = K.cols();
    const N_BC = 1;

    const reduced = new rom.ReducedSteady(Nphi_u + Nphi_p, Nphi_u + Nphi_p);

    reduced.Nphi_u(Nphi_u);
    reduced.Nphi_p(Nphi_p);
    reduced.N_BC(N_BC);
    reduced.addMatrices(P, M, K, B);
    reduced.addModes(modes);

    P.delete();
    M.delete();
    K.delete();
    B.delete();
    modes.delete();

    let Nphi_nut = 0;

    (async () => {
      let indexes = []
      for (var i = 0; i < Nphi_u; i ++ ) {
        indexes.push(i);
      }

      Nphi_nut = coeffL2.rows();
      reduced.Nphi_nut(Nphi_nut);
      let indexesNut = []
      for (var j = 0; j < Nphi_u; j ++ ) {
        indexesNut.push(j);
      }

      await Promise.all(indexesNut.map(async (indexNut) => {
        const C1Path = 'matrices/ct1_' + indexNut + "_mat.txt"
        const C2Path = 'matrices/ct2_' + indexNut + "_mat.txt"
        const C1 = new rom.Matrix(await readMatrixFile(storage, dataPath + C1Path));
        const C2 = new rom.Matrix(await readMatrixFile(storage, dataPath + C2Path));
        reduced.addCt1Matrix(C1, indexNut);
        reduced.addCt2Matrix(C2, indexNut);
      }));

      await Promise.all(indexes.map(async (index) => {
        const CPath = 'matrices/C' + index + "_mat.txt"
        const C = new rom.Matrix(await readMatrixFile(storage, dataPath + CPath));
        reduced.addCMatrix(C, index);
      }));

      reduced.preprocess();
      reduced.setRBF(mu, coeffL2);
      reduced.nu(temperatureToViscosity(initialTemperature)*1e-05);
      context.current = { reduced };
      setDataLoaded(true);
      coeffL2.delete();
    })();
  }

  useEffect(() => {
    if (!context.current) {
      trackPromise(initialize());
    }
    
    return () => {
      if (context.current) {
        const { reduced, fullScreenRenderer, polydata, actor, scalarBarActor, mapper } = context.current;
        reduced.delete();
        actor.delete();
        scalarBarActor.delete();
        mapper.delete();
        polydata.delete();
        fullScreenRenderer.delete();
        context.current = null;
      }
    };
  }, []);

  const resetCamera = () => {
    if (context.current) {
     const { fullScreenRenderer, focalPoint, cameraPosition, renderer, renderWindow } = context.current;
     renderer.getActiveCamera().setProjectionMatrix(null);
     const offset = Math.sqrt( (cameraPosition[0]-focalPoint[0])**2 + (cameraPosition[1]-focalPoint[1])**2 + (cameraPosition[2]-focalPoint[2])**2 )
     renderer.getActiveCamera().setPosition(cameraPosition[0], cameraPosition[1], cameraPosition[2] + offset);
     renderer.getActiveCamera().setViewUp(0.0, 1.0, 0.0)	    
     renderer.resetCamera();
     fullScreenRenderer.resize();
     renderer.getActiveCamera().zoom(1.3);
     renderWindow.render();
    }    
  }

  function takeScreenshot() {
    if (context.current) {
     const { renderWindow } = context.current;
     renderWindow.captureImages()[0].then(
       (image) => {
         (async () => {
           const blob = await (await fetch(image)).blob(); 
           var a = document.createElement("a");
           a.innerHTML = 'download';
           a.href = URL.createObjectURL(blob);
           a.download = "pitzDaily_T_" + temperatureValue + "_U_" + velocityValue + ".png";
           a.click();
         })();
       }
     );
    }    
  }

  function downloadData() {
    if (context.current) {
      const { reduced } = context.current;
      const data_string = reduced.exportUnstructuredGrid();
      var blob = new Blob([data_string], {
        type: 'text/plain'
      });
       var a = document.createElement("a");
       a.innerHTML = 'download';
       a.href = URL.createObjectURL(blob);
       a.download = "pitzDaily_T_" + temperatureValue + "_U_" + velocityValue + ".vtu";
       a.click();
    }    
  }

  useEffect(() => {
    if (context.current) {
      const { scalarBarActor, renderer, renderWindow } = context.current;
      if (renderWindow) {
        const currentTheme = window.localStorage.getItem('theme');
        const background = currentTheme === 'light' ? backgroundLight : backgroundDark;
        const textColor = currentTheme === 'light' ? textColorLight : textColorDark;

        const scalarBarActorStyle1 = {
          paddingBottom: 30,
          fontColor:  textColor,
          fontStyle: 'normal',
          fontFamily: theme.vtkText.fontFamily
        };

        renderer.setBackground(background);
        scalarBarActor.setAxisTextStyle(scalarBarActorStyle1);
        scalarBarActor.setTickTextStyle(scalarBarActorStyle1);
        scalarBarActor.updateTextureAtlas();
        scalarBarActor.updatePolyDataForLabels();		
        scalarBarActor.completedImage();
        scalarBarActor.update();
        scalarBarActor.modified();
        renderWindow.modified();
        renderWindow.render();
      }
    }
  }, [testVar, backgroundLight, backgroundDark]);

  useEffect(() => {
    if (context.current) {
      const { polydata, reduced, lookupTable, renderWindow, mapper } = context.current;
      reduced.nu(temperatureToViscosity(temperatureValue)*1e-05);
      reduced.solveOnline(new rom.Matrix([velocityValue]));
      const newU = reduced.reconstruct();
      polydata.getPointData().removeArray('uRec');
      var nCells = polydata.getNumberOfPoints();
      const array = vtkDataArray.newInstance({ name: 'uRec', size: nCells*3, numberOfComponents: 3, dataType: 'Float32Array' });
      for (let i = 0; i < nCells; i++) {
        let v =[newU[i], newU[i + nCells], newU[i + nCells * 2]];
        array.setTuple(i, v)
      }
      array.modified();
      polydata.getPointData().setScalars(array)
      polydata.getPointData().addArray(array);
      polydata.getPointData().setActiveScalars("uRec");
      const dataRange = [].concat(array ? array.getRange() : [0, 1]);
      lookupTable.setMappingRange(dataRange[0], dataRange[1]);
      lookupTable.updateRange();
      mapper.setScalarRange(dataRange[0],dataRange[1]);
      mapper.update();
      renderWindow.render();
    }
  }, [temperatureValue, velocityValue]);

  const myFunction = (eventSrcDesc, newValue) => {
    // console.log({ eventSrcDesc, newValue });
  };

  const handleTemperatureChange = (event, newValue) => {
    setTemperatureValue(newValue);
    stateDebounceMyFunction("slider-tate", newValue);
  };

  const handleVelocityChange = (event, newValue) => {
    setVelocityValue(newValue);
    stateDebounceMyFunction("slider-tate", newValue);
  };

  const [stateDebounceMyFunction] = useState(() =>
    debounce(myFunction, 300, {
      leading: false,
      trailing: true
    })
  );

  return (
    <div style={{ paddingBottom: 60}}>
      <div style={{ paddingBottom: 60}} ref={vtkContainerRef}>
        <Loader promiseTracker={usePromiseTracker}/>
      </div>
        <div
          style={{
            paddingBottom: 80,
            position: 'absolute',
            top: '60px',
            right: '20px',
            backgroundColor: background,
            padding: '5px',
            marginRight: '2%',
            border: '1px solid rgba(125, 125, 125)',
          }}
        >
          <Box className={classes.link} sx={{ height: '34px', width: '34px' }} onClick={downloadData}>
            <FontAwesomeIcon
              style={{width: '32px', height: '32px'}}
              icon={solid('download')}
            />
          </Box>
        </div>
        <div
          style={{
            paddingBottom: 60,
            //padding: 10,
            position: 'absolute',
            top: '60px',
            right: '70px',
            backgroundColor: background,
            padding: '5px',
            marginRight: '2%',
            border: '1px solid rgba(125, 125, 125)',
          }}
        >
           <Box className={classes.link} sx={{ height: '34px', width: '34px' }} onClick={takeScreenshot}>
             <FontAwesomeIcon
               style={{width: '32px', height: '32px'}}
               icon={solid('camera-retro')}
             />
           </Box>
        </div>
        <div
          style={{
            paddingBottom: 60,
            position: 'absolute',
            top: '60px',
            right: '120px',
            backgroundColor: background,
            padding: '5px',
            marginRight: '2%',
            border: '1px solid rgba(125, 125, 125)',
          }}
        >
          <Box className={classes.link} sx={{ height: '34px', width: '34px' }} onClick={resetCamera}>
            <FontAwesomeIcon
              style={{width: '32px', height: '32px'}}
              icon={solid('undo-alt')}
            />
          </Box>
        </div>
        <div
          style={{
            paddingTop: '100px',
            paddingBottom: 60,
            padding: 10,
            position: 'absolute',
            top: '60px',
            left: '20px',
            backgroundColor: background,
            border: '1px solid rgba(125, 125, 125)',
          }}
        >
          <div>
            <div style={{marginTop: '2%'}}>
            <Box sx={{ width: 300 }}>
            <Slider
              className={classes.slider}
              defaultValue={initialTemperature}
              onChange={handleTemperatureChange}
              step={1}
              min={-100}
              max={1000}
              valueLabelDisplay="auto"
            />
            </Box>
            </div>
            <div className={classes.vtkText}>
                Temperature (°C) 
            </div>
            <div style={{marginTop: '10%'}}>
            <Box sx={{ width: 300 }}>
            <Slider
              className={classes.slider}
              defaultValue={initialVelocity}
              onChange={handleVelocityChange}
              step={0.1}
              min={1}
              max={20.0}
              valueLabelDisplay="auto"
            />
            </Box>
            </div>
            <div className={classes.vtkText}>
                Inlet velocity (m/s) 
            </div>
          </div>
      </div>
    </div>
  );
}

export default PitzDaily;