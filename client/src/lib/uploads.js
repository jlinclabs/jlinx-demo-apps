import useAsync from './useAsync.js'

const MAX_FILE_SIZE_IN_MB = 200
const MAX_FILE_SIZE = MAX_FILE_SIZE_IN_MB * 1000000

export async function uploadFile(file){
  if (!file) throw new Error(`file is required`)
  if (file.size > MAX_FILE_SIZE)
    throw new Error(
      `"${file.name}" is too big. Please select a file smaller ` +
      `than ${MAX_FILE_SIZE_IN_MB}mb.`
    )
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch(
    `/api/uploads`,
    {method: 'POST', body: formData}
  )
  if (!response.ok){
    throw new Error(`file upload faild ${process.statusCode}`)
  }
  const { error, url } = await response.json()
  if (error) throw new Error(error)
  return url
}

export function useUploadFile(config){
  return useAsync(uploadFile, config)
}
