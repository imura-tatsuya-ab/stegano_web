import * as React from 'react'
import { Paper, Typography, Button, Grid } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ImageSearchIcon from '@material-ui/icons/ImageSearch'
import { ImageCanvas, DrawableCanvas, EncodeImageCanvas, EncodeStringCanvas } from './Canvas'
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
  },
}))

const Encode: React.FC = () => {
  const classes = useStyles()
  const [cover, setCover] = React.useState<CanvasRenderingContext2D>()
  const [secret, setSecret] = React.useState<CanvasRenderingContext2D>()
  const { image, handleFileChange } = useImage()
  return (
    <Paper className={classes.paper}>
      <Typography className={classes.title} variant="h4" color="primary">
        Encode
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
        <ImageCanvas img={image} onContextChange={ctx => setCover(ctx)} />
        <DrawableCanvas
          width={image?.width}
          height={image?.height}
          onContextChange={ctx => setSecret(ctx)}
        />
        <EncodeImageCanvas
          cover={cover}
          secret={secret}
          width={image?.width}
          height={image?.height}
        />
        <EncodeStringCanvas img={image} />
      </Grid>
    </Paper>
  )
}

export default Encode
