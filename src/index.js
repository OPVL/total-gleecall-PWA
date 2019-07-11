if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("/dist/sw.js")
        .then(registration => {
            console.log(registration);
        })
        .catch(error => console.error(error));
}