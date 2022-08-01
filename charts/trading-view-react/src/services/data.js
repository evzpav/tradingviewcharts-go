export function getData() {
    return fetch('http://localhost:9000/data')
      .then(data => data.json())
  }