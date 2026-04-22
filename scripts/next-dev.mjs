import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

const host = process.env.HOST || '0.0.0.0';
const preferredPort = Number(process.env.PORT || 3001);
const scanLimit = Number(process.env.PORT_SCAN_LIMIT || 20);

function canListen(port) {
  return new Promise((resolve, reject) => {
    const server = createServer();

    server.once('error', (error) => {
      if (error?.code === 'EADDRINUSE') {
        resolve(false);
        return;
      }

      reject(error);
    });

    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(port, host);
  });
}

async function findOpenPort(startPort) {
  for (let port = startPort; port < startPort + scanLimit; port += 1) {
    if (await canListen(port)) return port;
  }

  throw new Error(
    `No hay puertos libres entre ${startPort} y ${startPort + scanLimit - 1}.`,
  );
}

const port = await findOpenPort(preferredPort);

if (port !== preferredPort) {
  console.log(`Puerto ${preferredPort} ocupado. Iniciando Next.js en ${port}.`);
}

const child = spawn(
  'next',
  ['dev', '--hostname', host, '--port', String(port)],
  {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  },
);

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
