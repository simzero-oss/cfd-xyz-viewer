// Copyright (c) 2022 Carlos Peña-Monferrer. All rights reserved.
// This work is licensed under the terms of the MIT license.
// For a copy, see <https://opensource.org/licenses/MIT>.

import { useEffect } from "react";
import Grid from '@mui/material/Grid'
import ShowCards  from './ShowCards';
import { makeStyles } from "@mui/styles";
import posts from "./list";
import { global } from '../theme';

function Home() {
  useEffect(() => {
   document.title = "cfd.xyz"
  }, []);

  const useStyles = makeStyles(global);
  const classes = useStyles();

  return (
    <div className={classes.root} align="center">
      <Grid
        container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 16 }}
        display="flex"
        flexDirection="row"
      >
        {posts.map(post => (
           <ShowCards key={post.key} post={post} />
        ))}
      </Grid>
    </div>
  );
}

export default Home;
