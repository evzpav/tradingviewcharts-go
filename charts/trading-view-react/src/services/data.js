export function getData() {
    return fetch('http://localhost:9900/data')
      .then(data => data.json())
  }