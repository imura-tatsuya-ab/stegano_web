import * as React from 'react'
import { Paper, Typography, Button, Grid } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ImageSearchIcon from '@material-ui/icons/ImageSearch'
import { ImageCanvas, DecodableCanvas } from './Canvas'
import useImage from '../hooks/image'

const useStyles = makeStyles(theme => ({
  hidden: {
    display: 'none',
  },
  paper: {
    padding: 30,
    margin: 30,
  },
  title: {
    marginTop: 10,
    marginBottom: 30,
  },
  button: {
    margin: theme.spacing(1),
    marginBottom: 30,
  },
}))

const Decode: React.FC = () => {
  const classes = useStyles()
  const [stego, setStego] = React.useState<CanvasRenderingContext2D>()
  const { image, handleFileChange } = useImage()
  return (
    <Paper className={classes.paper}>
      <Typography className={classes.title} variant="h4" color="primary">
        Decode
      </Typography>
      <label>
        <Button
          variant="contained"
          color="primary"
          component="span"
          startIcon={<ImageSearchIcon />}
        >
          画像選択
        </Button>
        <input
          className={classes.hidden}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </label>
      <Grid container direction="column" justify="center" alignItems="flex-start">
        <ImageCanvas img={image} onContextChange={ctx => setStego(ctx)} />
        <DecodableCanvas stego={stego} width={image?.width} height={image?.height} />
      </Grid>
    </Paper>
  )
}

export default Decode
