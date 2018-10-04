function papaPromisified(file) {
  return new Promise(function(resolve, reject) {
    let config = {
      encoding: "ISO-8859-1",
      delimiter: ",",
      download: false,
      skipEmptyLines: true,
      error: reject,
      complete: resolve
    };

    Papa.parse(file, config);
  });
}

export { papaPromisified };
