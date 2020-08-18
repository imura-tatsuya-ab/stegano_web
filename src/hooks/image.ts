import * as React from 'react'

const useImage = () => {
  const [image, setImage] = React.useState<HTMLImageElement>()
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0]
      try {
        const url = await readAsDataURL(file)
        const img = await loadImage(url)
        setImage(img)
      } catch (e) {
        console.log(e)
      }
    }
  }
  return { image, handleFileChange }
}

const readAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = e => reject(e)
    img.src = src
  })
}

export default useImage
