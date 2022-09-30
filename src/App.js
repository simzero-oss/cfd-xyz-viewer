// Copyright (c) 2022 Carlos Peña-Monferrer. All rights reserved.
// This work is licensed under the terms of the MIT license.
// For a copy, see <https://opensource.org/licenses/MIT>.

import { makeStyles } from "@mui/styles";
import { lightTheme, darkTheme } from './components/theme';
import { React, useState, useEffect, createContext } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
   Navigation,
   Footer,
   Home,
   About,
   Error,
   OF,
   Incompressible,
   SimpleFoam,
   PitzDaily,
   Bump2D,
   MixerVessel2D,
   MotorBike,
   TurbineSiting,
   WindAroundBuildings,
   Tools,
   Steady,
   Slicer,
} from "./components";

export const ThemeContext = createContext({
  name: "light",
  setName: () => {}
});

function App() {

  useEffect(() => {
   document.title = "cfd.xyz"
  }, []);

  const themeType = window.localStorage.getItem('theme') || "light"
  const theme = themeType === 'light' ? lightTheme : darkTheme;
  const useStyles =  makeStyles(theme);
  const classes = useStyles();
  const [name, setName] = useState(null);
  const value = {name, setName};

  return (
    <div>
      <Router>
        <div className={classes.mainWrapper}>
          <ThemeContext.Provider value={value}>
            <Navigation />
            <Routes>
              <Route path="/" exact element={<Home />} />
              <Route path="/OF" exact element={<OF />} />
              <Route path="/OF/incompressible" exact element={<Incompressible />} />
              <Route path="/OF/incompressible/simpleFoam" exact element={<SimpleFoam />} />
              <Route path="/OF/incompressible/simpleFoam/PitzDaily" exact element={<PitzDaily />} />
              <Route path="/OF/incompressible/simpleFoam/Bump2D" exact element={<Bump2D />} />
              <Route path="/OF/incompressible/simpleFoam/MixerVessel2D" exact element={<MixerVessel2D />} />
              <Route path="/OF/incompressible/simpleFoam/TurbineSiting" exact element={<TurbineSiting />} />
              <Route path="/OF/incompressible/simpleFoam/WindAroundBuildings" exact element={<WindAroundBuildings />} />
              <Route path="/OF/incompressible/simpleFoam/MotorBike" exact element={<MotorBike />} />
              <Route path="/Tools" exact element={<Tools />} />
              <Route path="/Tools/ITHACA-FV_Steady" exact element={<Steady />} />
              <Route path="/Tools/Slicer" exact element={<Slicer />} />
              <Route path="/About" exact element={<About />} />
              <Route path="*" exact element={<Error />} status={404} />
            </Routes>
            <Footer />
          </ThemeContext.Provider>
        </div>
      </Router>
    </div>
  );
}

export default App;
