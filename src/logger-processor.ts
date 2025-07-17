process.stdin.on('data', (chunk) => {
  process.stdout.write(chunk);
});
