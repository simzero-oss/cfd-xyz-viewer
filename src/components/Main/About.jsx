import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { makeStyles } from '@mui/styles';
import { lightTheme, darkTheme } from './../theme';

function About() {
  useEffect(() => {
    document.title = "About"
  }, []);

  const localTheme = window.localStorage.getItem('theme') || "light";
  const theme = localTheme === 'light' ? lightTheme : darkTheme;
  const useStyles = makeStyles(theme);
  const classes = useStyles();

  return (
    <div className={classes.root}>
        <Box sx={{ flexGrow: 1 }}>
        <Grid
          container
          alignItems="center"
	  justifyContent="center"
        >
	  <Grid item md={11}>
          <div
            className={classes.titleText}
            style={{
              marginTop: 10
            }}
          >
              The Web app
          </div>
          <div
            className={classes.bodyText}
            style={{
              marginTop: 0,
              marginRight: 0,
              marginBottom: 20,
              justifyContent: "left"
            }}
          >
            cfd.xyz is an open-source React web app to efficiently and easily
            explore fluid dynamics problems for a wide range of parameters.
            The framework provides a proof of technology for OpenFOAM tutorials,
            showing the whole process from the generation of the surrogate
            models to the web browser. It also includes a standalone web tool
            for visualizing users' surrogate models by directly dragging and
            dropping the output folder of the ROM offline stage. Beyond the
            current proof of technology, this enables a collaborative effort
            for the implementation of OpenFOAM-based models in applications
            demanding real-time solutions such as digital twins and other
            digital transformation technologies.
          </div>
          <div
            className={classes.bodyText}
            style={{
              marginTop: 0,
              marginRight: 0,
              marginBottom: 20,
              justifyContent: "left"
            }}
          >
             With this development, we aim to create a shared space where
             canonical and industrial computational fluid dynamics (CFD)
             problems can be visualized and analyzed without carrying out a
             simulation, or as a preliminary step for optimizing parameters of
             new simulations. Having an open-source centralized service has
             several advantages, not only from an educational, optimization and
             reproducibility point of view but also from a CO2 footprint
             perspective.
          </div>
          <div
            className={classes.bodyText}
            style={{
              marginTop: 0,
              marginRight: 0,
              marginBottom: 20,
              justifyContent: "center"
            }}
          >
            The web app relies on the rom.js module, a JavaScript port of a set
            of open-source packages to solve the online stage of reduced-order
            models (ROM) generated by the ITHACA-FV tool. It can also be
            executed outside a web browser within a backend JavaScript runtime
            environment. Please visit and support the open-source packages used
            in this work:
            <a
              target='_blank'
              rel='noreferrer'
              href='https://www.openfoam.com'
            >
              {' OpenFOAM'}
            </a>,
            <a
              target='_blank'
              rel='noreferrer'
              href='https://github.com/mathLab/ITHACA-FV'
            >
              {' ITHACA-FV'}
            </a>,
            <a
              target='_blank'
              rel='noreferrer'
              href='https://www.kitware.com'
            >
              {' Kitware'}
            </a>,
            <a
              target='_blank'
              rel='noreferrer'
              href='https://eigen.tuxfamily.org'
            >
              {' Eigen'}
            </a>,
            <a
              target='_blank'
              rel='noreferrer'
              href='https://github.com/bgrimstad/splinter.git'
            >
              {' Splinter'}
            </a>,
            <a
              target="_blank"
              rel="noreferrer"
              href="https://emscripten.org"
            >
              {' Emscripten'}
            </a>,
            <a target="_blank"
              rel="noreferrer"
              href="https://mui.com"
            >
              {' MUI'}
            </a>,
            <a
              target="_blank"
              rel="noreferrer"
              href="https://reactjs.org"
            >
              { ' React'}
            </a>,
            and many others. You'll find a list of all the packages in the code
            repositories.
          </div>
          <div
            className={classes.bodyText}
            style={{
              marginTop: 0,
              marginRight: 0,
              marginBottom: 20,
              justifyContent: "center"
            }}
          >
            This is a beta version, please handle with care. Further
            features, optimizations and fixes are expected.
          </div>
          <div
            className={classes.bodyText}
            style={{
              marginTop: 0,
              marginRight: 0,
              marginBottom: 20,
              justifyContent: "center"
            }}
            style={{
              marginTop: 0,
              marginLeft: 0,
              marginRight: 0,
              marginBottom: 20
            }}
          >
            <div>3D view control keys: </div>
            <div> &nbsp;&nbsp; * Rotate: left click</div>
            <div> &nbsp;&nbsp; * Pan: shift + left click</div>
            <div> &nbsp;&nbsp; * Spin: Ctrl/Alt + left click</div>
            <div> &nbsp;&nbsp; * Zoom: mouse wheel</div>
          </div>
          <div
            className={classes.titleText}
          >
              The Code
          </div>
          <div
            className={classes.bodyText}
            style={{
              whiteSpace: "pre-wrap"
            }}
          >
            cfd.xyz is an open-source web app. You can install it locally,
            fix bugs or add new features at the
            <a
              target='_blank'
              rel='noreferrer'
              href='https://github.com/simzero-oss/cfd-xyz'
            >
              {' cfd.xyz '}
            </a>
            or
            <a
              target='_blank'
              rel='noreferrer'
              href='https://github.com/simzero-oss/rom-js'
            >
              {' rom-js '}
            </a>
            GitHub repositories. Everyone is welcome to contribute to this
            project.
          </div>
          <div
            className={classes.titleText}
          >
              The Licenses and trademarks
          </div>
          <div
            className={classes.bodyText}
            style={{ marginTop: 0, marginRight: 0, marginBottom: 20,  whiteSpace: "pre-wrap"}}
          >
            <div
            style={{
              marginTop: 0,
              marginLeft: 0,
              marginRight: 0,
              marginBottom: 20,
              justifyContent: 'center'
            }}
            >
              cfd.xyz code and images (excluding the logo) are mainly covered
              by
              <a
                target='_blank'
                rel='noreferrer'
                href='https://github.com/simzero-oss/cfd-xyz/blob/main/LICENSE'
              >
		{' MIT '}
              </a>
              and
              <a
                target='_blank'
                rel='noreferrer'
                href='https://creativecommons.org/licenses/by/4.0'
              >
		{' CC BY 4.0 '}
              </a>
              licenses, respectively. Further details about the licenses can be
              found at
              <a
                target='_blank'
                rel='noreferrer'
                href='https://github.com/simzero-oss/cfd-xyz#License'
              >
		{' cfd.xyz licenses'}
              </a>.
              You can reuse this code under the terms of these licenses.
              Please cite this website and related repositories to help us to
              build more assets.
            </div>
            <div
            style={{
              marginTop: 0,
              marginLeft: 0,
              marginRight: 0,
              marginBottom: 20,
              justifyContent: "center"
            }}
            >
              cfd.xyz and SIMZERO are exclusive trademarks. Their use is only
              allowed in the context of this web app and in compliance with
              trademark law. Adaptations or modifications of the cfd.xyz logo
              are not permitted.
            </div>
            <div
              style={{
                marginTop: 0,
                marginLeft: 0,
                marginRight: 0,
                marginBottom: 20,
                justifyContent: "center"
              }}
            >
              This offering is not approved or endorsed by OpenCFD Limited,
              producer and distributor of the OpenFOAM software via
              www.openfoam.com, and owner of the OPENFOAM® and OpenCFD®
              trade marks.
            </div>
          </div>
          <div
            className={classes.titleText}
          >
              The Authors
          </div>
          <div
            className={classes.bodyText}
            style={{
              marginTop: 0,
              marginLeft: 0,
              marginRight: 0,
              marginBottom: 20,
              justifyContent: 'center',
              whiteSpace: 'pre-wrap'
            }}
          >
	    cfd.xyz is developed and maintained by
            <a
              target='_blank'
              rel='noreferrer'
              href='https://www.simzero.com'
            >
              {' SIMZERO®'}
            </a>. 
            Please feel free to contact us by email (info@simzero.com) or
            joining the
            <a
              target="_blank"
              rel="noreferrer"
              href="https://join.slack.com/t/cfd-xyz/shared_invite/zt-15qjacmzo-1woWqeklQ0IeXZb_F6ueaQ"
            >
              {' Slack channel'}
            </a>.
          </div>
          <div
            className={classes.titleText}
          >
              The Funding
          </div>
          <div
            className={classes.bodyText}
            style={{
              marginTop: 0,
              marginLeft: 0,
              marginRight: 0,
              marginBottom: 20,
              justifyContent: "center",
              whiteSpace: "pre-wrap"
            }}
          >
             cfd.xyz is free of charge, with no ads, popups,
             registration or personal data collection.
          </div>
          <div
            className={classes.bodyText}
            style={{
              marginTop: 0,
              marginLeft: 0,
              marginRight: 0,
              marginBottom: 20,
              justifyContent: "center",
              whiteSpace: "pre-wrap"
            }}
          >
             This is a self-funded initiative. If you like the tool and the
             mission and want to help with new developments and server costs
             please
             <a
               target='_blank'
               rel='noreferrer'
               href='https://www.paypal.com/donate/?hosted_button_id=KKB4LH96E59A4'
             >
               {' donate '}
             </a>
             (PayPal).
          </div>
          <div
            className={classes.titleText}
          >
              The Terms and conditions
          </div>
          <div
            className={classes.bodyText}
            style={{
              marginTop: 0,
              marginLeft: 0,
              marginRight: 0,
              marginBottom: 20,
              justifyContent: "center",
              whiteSpace: "pre-wrap"
            }}
          >
            You agree that you use the site and the content at your own risk,
            and understand that this service is provided to you on an "AS IS"
            and "AS AVAILABLE" basis. The service is provided without
            warranties of any kind, including but not limited to content
            accuracy, reliability or completeness. We shall not be subject
            to liability for truth, accuracy or completeness of any information
            conveyed to the user. If your use of the site or the content
            results in the need for servicing, or replacing equipment or data,
            we shall not be responsible for those costs.
          </div>
	</Grid>
	</Grid>
        </Box>
    </div>
  );
}

export default About;
