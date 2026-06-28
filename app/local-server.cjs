const http = require('node:http')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawn } = require('node:child_process')

const root = __dirname
const bundledDist = path.join(root, 'dist')
const distDir = fs.existsSync(path.join(bundledDist, 'index.html')) ? bundledDist : root
const converterScript = path.join(root, 'vic3_melt.py')
const port = Number(process.env.PORT || 4173)
const host = process.env.HOST || '127.0.0.1'

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    ...headers,
  })
  res.end(body)
}

function safeName(value) {
  return decodeURIComponent(value || 'save.v3').replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname)
  const requested = urlPath === '/' ? '/index.html' : urlPath
  const filePath = path.normalize(path.join(distDir, requested))

  if (!filePath.startsWith(distDir)) {
    send(res, 403, 'Forbidden')
    return
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      fs.createReadStream(path.join(distDir, 'index.html')).pipe(res)
      return
    }

    res.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream',
      'Content-Length': stat.size,
    })
    fs.createReadStream(filePath).pipe(res)
  })
}

function runConverter(inputPath, outputPath, callback) {
  const bundledPython = path.join(root, 'runtime', 'python', 'python.exe')
  const localPython = path.join(root, 'python', 'python.exe')
  const tryCommands = process.platform === 'win32'
    ? [bundledPython, localPython, 'py', 'python']
    : ['python3', 'python']
  const commands = tryCommands.filter((command) => {
    return !path.isAbsolute(command) || fs.existsSync(command)
  })
  let index = 0
  let lastError = ''

  const attempt = () => {
    const command = commands[index]
    const child = spawn(command, [converterScript, inputPath, '-o', outputPath], {
      cwd: root,
      windowsHide: true,
    })

    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })
    child.on('error', (err) => {
      lastError = err.message
      index += 1
      if (index < commands.length) attempt()
      else callback(new Error(`Python non trovato: ${lastError}`))
    })
    child.on('close', (code) => {
      if (code === 0) {
        callback(null, stdout)
        return
      }
      lastError = stderr || stdout || `converter exited with code ${code}`
      index += 1
      if (index < commands.length) attempt()
      else callback(new Error(lastError))
    })
  }

  attempt()
}

function handleConvert(req, res) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vic3-save-'))
  const inputPath = path.join(tempDir, safeName(req.headers['x-file-name']))
  const outputPath = `${inputPath}.gamestate.txt`
  const writeStream = fs.createWriteStream(inputPath)

  req.pipe(writeStream)
  req.on('error', (err) => {
    send(res, 500, `Upload fallito: ${err.message}`)
  })
  writeStream.on('error', (err) => {
    send(res, 500, `Scrittura temporanea fallita: ${err.message}`)
  })
  writeStream.on('finish', () => {
    runConverter(inputPath, outputPath, (err) => {
      if (err) {
        send(res, 500, `Conversione fallita: ${err.message}`)
        fs.rm(tempDir, { recursive: true, force: true }, () => {})
        return
      }

      fs.stat(outputPath, (statErr, stat) => {
        if (statErr) {
          send(res, 500, `Output non trovato: ${statErr.message}`)
          fs.rm(tempDir, { recursive: true, force: true }, () => {})
          return
        }

        res.writeHead(200, {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Length': stat.size,
          'X-Converted-By': 'librakaly',
        })
        const readStream = fs.createReadStream(outputPath)
        readStream.pipe(res)
        readStream.on('close', () => {
          fs.rm(tempDir, { recursive: true, force: true }, () => {})
        })
      })
    })
  })
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/convert') {
    handleConvert(req, res)
    return
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    serveStatic(req, res)
    return
  }

  send(res, 405, 'Method not allowed')
})

server.listen(port, host, () => {
  console.log(`GitGud Save Analyzer local server`)
  console.log(`Open http://${host === '0.0.0.0' ? '127.0.0.1' : host}:${port}/`)
})
