function papaPromisified(file, header = false) {
  return new Promise(function(resolve, reject) {
    let config = {
      encoding: "ISO-8859-1",
      delimiter: "",
      download: false,
      skipEmptyLines: true,
      error: reject,
      complete: resolve,
      header
    };

    Papa.parse(file, config);
  });
}

export { papaPromisified };
