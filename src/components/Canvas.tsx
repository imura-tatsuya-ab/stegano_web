import * as React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Grid, Button, TextField } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import FormatPaintIcon from '@material-ui/icons/FormatPaint'
import VisibilityIcon from '@material-ui/icons/Visibility'
import SaveAltIcon from '@material-ui/icons/SaveAlt'

const useStyles = makeStyles(theme => ({
  canvas: {
    border: `solid 2px ${theme.palette.primary.main}`,
    borderRadius: '5px',
    marginTop: 30,
  },
}))

export const ImageCanvas: React.FC<{
  img?: HTMLImageElement
  onContextChange?: (ctx: CanvasRenderingContext2D) => void
}> = ({ img, onContextChange }) => {
  const classes = useStyles()
  const ref = React.useRef<HTMLCanvasElement>(null)
  React.useEffect(() => {
    if (ref.current) {
      onContextChange(ref.current.getContext('2d'))
    }
  }, [onContextChange])
  React.useEffect(() => {
    if (ref.current && img) {
      const ctx = ref.current.getContext('2d')
      ctx.drawImage(img, 0, 0, img.width, img.height)
    }
  }, [img])
  if (!img) return <></>
  return (
    <canvas className={classes.canvas} ref={ref} width={img.width} height={img.height}></canvas>
  )
}

export const DrawableCanvas: React.FC<{
  width?: number
  height?: number
  onContextChange?: (ctx: CanvasRenderingContext2D) => void
}> = p => {
  const classes = useStyles()
  const [drawing, setDrawing] = React.useState(false)
  const [color, setColor] = React.useState('#000000')
  const [lineWidth, setLineWidth] = React.useState('5')
  const ref = React.useRef<HTMLCanvasElement>(null)
  React.useEffect(() => {
    if (ref.current) {
      const ctx = ref.current.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, p.width, p.height)
      p.onContextChange(ctx)
    }
  }, [p.onContextChange])
  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      setDrawing(true)
      if (ref.current) {
        const ctx = ref.current.getContext('2d')
        ctx.beginPath()
        ctx.lineWidth = Number(lineWidth)
        ctx.lineCap = 'round'
        ctx.strokeStyle = color
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
      }
    },
    [color, lineWidth]
  )
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(false)
  }
  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (ref.current && drawing) {
        const ctx = ref.current.getContext('2d')
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
        ctx.stroke()
      }
    },
    [drawing]
  )
  const handleMouseLeave = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(false)
  }
  const handleClear = () => {
    if (ref.current) {
      const ctx = ref.current.getContext('2d')
      ctx.clearRect(0, 0, p.width, p.height)
      ctx.beginPath()
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, p.width, p.height)
    }
  }
  const handleColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value)
  }
  const handleLineWidth = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLineWidth(e.target.value)
  }
  if (!p.width && !p.height) return <></>
  return (
    <>
      <Grid container item>
        <canvas
          className={classes.canvas}
          ref={ref}
          width={p.width}
          height={p.height}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        ></canvas>
      </Grid>
      <Grid container item direction="row" justify="flex-start" alignItems="center" spacing={3}>
        <Grid item>
          <input type="color" name="color" list="colors" onChange={handleColor} />
          <datalist id="colors">
            <option value="#ffffff"></option>
            <option value="#000000"></option>
            <option value="#ff0000"></option>
            <option value="#00ff00"></option>
            <option value="#0000ff"></option>
            <option value="#ffff00"></option>
            <option value="#ff00ff"></option>
            <option value="#00ffff"></option>
          </datalist>
        </Grid>
        <Grid item>
          <input
            type="range"
            name="range"
            value={lineWidth}
            min={1}
            max={100}
            onChange={handleLineWidth}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DeleteIcon />}
            onClick={handleClear}
          >
            クリア
          </Button>
        </Grid>
      </Grid>
    </>
  )
}

const encodeImage = (
  canvas: HTMLCanvasElement,
  cover: CanvasRenderingContext2D,
  secret: CanvasRenderingContext2D
) => {
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height
  const imageData = ctx.getImageData(0, 0, width, height)
  const coverData = cover.getImageData(0, 0, width, height).data
  const secretData = secret.getImageData(0, 0, width, height).data
  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i] = (coverData[i] & 0b11111110) | (secretData[i] >> 7) // R
    imageData.data[i + 1] = (coverData[i + 1] & 0b11111110) | (secretData[i + 1] >> 7) // G
    imageData.data[i + 2] = (coverData[i + 2] & 0b11111110) | (secretData[i + 2] >> 7) // B
    imageData.data[i + 3] = 255
  }
  ctx.putImageData(imageData, 0, 0)
}

const encodeString = (
  canvas: HTMLCanvasElement,
  cover: CanvasRenderingContext2D,
  secret: string
) => {
  const encoder = new TextEncoder()
  const uint8View = encoder.encode(secret)
  const byteSize = uint8View.length
  // 32bit(データバイトサイズ) + データサイズ * 8bit
  const bits = new Uint8Array(32 + byteSize * 8)
  // 最初の32bitにデータ長を保存する
  for (let i = 0; i < 32; i++) {
    const bit = (byteSize & (1 << i)) >> i
    bits[i] = bit
  }
  // データを保存
  for (let i = 0; i < byteSize; i++) {
    const byteData = uint8View[i]
    for (let j = 0; j < 8; j++) {
      const bit = (byteData & (1 << j)) >> j
      bits[32 + i * 8 + j] = bit
    }
  }
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height
  const imageData = ctx.getImageData(0, 0, width, height)
  const coverData = cover.getImageData(0, 0, width, height).data
  let j = 0
  for (let i = 0; i < imageData.data.length; i += 4) {
    let r = coverData[i]
    let g = coverData[i + 1]
    let b = coverData[i + 2]
    if (j < bits.length) {
      r = (r & 0b11111110) | bits[j]
      j++
    }
    if (j < bits.length) {
      g = (g & 0b11111110) | bits[j]
      j++
    }
    if (j < bits.length) {
      b = (b & 0b11111110) | bits[j]
      j++
    }
    imageData.data[i] = r // R
    imageData.data[i + 1] = g // G
    imageData.data[i + 2] = b // B
    imageData.data[i + 3] = 255
  }
  ctx.putImageData(imageData, 0, 0)
}

const saveImage = (canvas: HTMLCanvasElement) => {
  canvas.toBlob(blob => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'stego'
    a.click()
  })
}

export const EncodableCanvas: React.FC<{
  cover: CanvasRenderingContext2D
  width?: number
  height?: number
}> = ({ cover, width, height }) => {
  const classes = useStyles()
  const [secretCtx, setSecretCtx] = React.useState<CanvasRenderingContext2D>()
  const [secretString, setSecretString] = React.useState('')
  const ref = React.useRef<HTMLCanvasElement>(null)
  const handleImageEncode = React.useCallback(() => {
    if (ref.current) {
      encodeImage(ref.current, cover, secretCtx)
    }
  }, [secretCtx, cover])

  const handleStringEncode = React.useCallback(() => {
    if (ref.current) {
      encodeString(ref.current, cover, secretString)
    }
  }, [secretString, cover])
  const handleSave = () => {
    if (ref.current) {
      saveImage(ref.current)
    }
  }
  if (!cover) return <></>
  return (
    <Grid container direction="column" spacing={3}>
      <DrawableCanvas width={width} height={height} onContextChange={ctx => setSecretCtx(ctx)} />
      <Grid container item>
        <canvas className={classes.canvas} ref={ref} width={width} height={height}></canvas>
      </Grid>
      <Grid container item>
        <TextField
          label="エンコードしたい文字列"
          multiline
          rowsMax={4}
          variant="outlined"
          value={secretString}
          onChange={e => setSecretString(e.target.value)}
        />
      </Grid>
      <Grid container item direction="row" justify="flex-start" alignItems="center" spacing={3}>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FormatPaintIcon />}
            onClick={handleImageEncode}
          >
            画像エンコード
          </Button>
        </Grid>
        <Grid item>
          <Button
            disabled={secretString.length <= 0}
            variant="contained"
            color="primary"
            startIcon={<FormatPaintIcon />}
            onClick={handleStringEncode}
          >
            文字列エンコード
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveAltIcon />}
            onClick={handleSave}
          >
            保存
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

const decodeImage = (canvas: HTMLCanvasElement, stego: CanvasRenderingContext2D) => {
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height
  const imageData = ctx.getImageData(0, 0, width, height)
  const stegoData = stego.getImageData(0, 0, width, height).data
  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i] = (stegoData[i] & 0b00000001) > 0 ? 0b11111111 : 0b00000000
    imageData.data[i + 1] = (stegoData[i + 1] & 0b00000001) > 0 ? 0b11111111 : 0b00000000
    imageData.data[i + 2] = (stegoData[i + 2] & 0b00000001) > 0 ? 0b11111111 : 0b00000000
    imageData.data[i + 3] = 255
  }
  ctx.putImageData(imageData, 0, 0)
}

const decodeString = (stego: CanvasRenderingContext2D, width: number, height: number): string => {
  const stegoData = stego.getImageData(0, 0, width, height).data
  // 最初にデータサイズだけ取得する
  let byteSize = 0
  let j = 0
  for (let i = 0; i < stegoData.length; i += 4) {
    if (j < 32) {
      byteSize |= (stegoData[i] & 0b00000001) << j
      j++
    }
    if (j < 32) {
      byteSize |= (stegoData[i + 1] & 0b00000001) << j
      j++
    }
    if (j < 32) {
      byteSize |= (stegoData[i + 2] & 0b00000001) << j
      j++
    }
    if (j >= 32) break
  }
  if (byteSize <= 0) return ''

  const bits = new Uint8Array(32 + byteSize * 8)
  const uint8View = new Uint8Array(byteSize)
  j = 0
  for (let i = 0; i < stegoData.length; i += 4) {
    if (j < bits.length) {
      bits[j] = stegoData[i] & 0b00000001
      j++
    }
    if (j < bits.length) {
      bits[j] = stegoData[i + 1] & 0b00000001
      j++
    }
    if (j < bits.length) {
      bits[j] = stegoData[i + 2] & 0b00000001
      j++
    }
    if (j >= bits.length) break
  }
  // データを取り出す
  for (let i = 0; i < byteSize; i++) {
    let byteData = 0
    for (let j = 0; j < 8; j++) {
      byteData |= bits[32 + i * 8 + j] << j
    }
    uint8View[i] = byteData
  }
  const decoder = new TextDecoder()
  return decoder.decode(uint8View)
}

export const DecodableCanvas: React.FC<{
  stego: CanvasRenderingContext2D
  width?: number
  height?: number
}> = ({ stego, width, height }) => {
  const classes = useStyles()
  const [secretString, setSecretString] = React.useState('')
  const ref = React.useRef<HTMLCanvasElement>(null)
  const handleImageDecode = React.useCallback(() => {
    if (ref.current) {
      decodeImage(ref.current, stego)
    }
  }, [stego])
  const handleStringDecode = React.useCallback(() => {
    setSecretString(decodeString(stego, width, height))
  }, [stego])
  if (!stego) return <></>
  return (
    <Grid container direction="column" spacing={3}>
      <Grid container item>
        <canvas className={classes.canvas} ref={ref} width={width} height={height}></canvas>
      </Grid>
      <Grid container item>
        <TextField
          label="デコードした文字列"
          multiline
          rowsMax={4}
          variant="outlined"
          value={secretString}
          InputProps={{
            readOnly: true,
          }}
        />
      </Grid>
      <Grid container item direction="row" justify="flex-start" alignItems="center" spacing={3}>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            startIcon={<VisibilityIcon />}
            onClick={handleImageDecode}
          >
            画像デコード
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            startIcon={<VisibilityIcon />}
            onClick={handleStringDecode}
          >
            文字列デコード
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}
