if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("/gleecall.api/dist/sw.js")
        .then(registration => {
            console.log(registration);
        })
        .catch(error => console.error(error));
}

const searchForm = document.querySelector('#searchBox');

searchForm.addEventListener('submit', (event) => {
    console.log(event);
    search(event);
});

function createGroups(collection) {
    let html = "";
    collection.forEach(group => {
        console.log(group);
        if (group.entities.length > 0) {

            html += '<div class="card"><strong>' + group.niceName + '</strong><br>';
            group.entities.forEach(entity => {
                html += `<button href="#${entity.entityId}" id="E${entity.entityId}">${entity.title}</button><br>`;
            });
            html += '</div>';
        }
    });
    return html;
}

function handleResults(data) {
    let sorted = [{
            "name": "ClientCorporation",
            "entities": [],
            "niceName": "Companies"
        },
        {
            "name": "Candidate",
            "entities": [],
            "niceName": "Candidates"
        },
        {
            "name": "ClientContact",
            "entities": [],
            "niceName": "Contacts"
        },
        {
            "name": "JobOrder",
            "entities": [],
            "niceName": "Job Orders"
        },
        {
            "name": "Placement",
            "entities": [],
            "niceName": "Placements"
        },
        {
            "name": "Opportunity",
            "entities": [],
            "niceName": "Opportunities"
        },
        {
            "name": "Lead",
            "entities": [],
            "niceName": "Leads"
        }
    ];

    for (const entity of data) {
        // see if entityType already exists in array
        for (const group of sorted) {
            if (group.name == entity.entityType) {
                group.entities.push(entity);
                break;
            }
        }
    }

    return createGroups(sorted);
}

function auth() {
    return {
        // mode: 'cors',
        headers: new Headers({
            // eslint-disable-next-line no-undef
            Authorization: `Bearer ${tokens[1]}`
        })
    }
}

function search(event) {
    event.preventDefault();
    const term = document.querySelector('#searchTerm').value;
    const searchScreen = document.querySelector('#screen-search');
    searchScreen.innerHTML = loadingSpinner;

    console.log(term);

    // eslint-disable-next-line no-undef
    fetch(`${tokens[2]}find?query=${term}&BhRestToken=${tokens[1]}`)
        .then(response => response.json())
        .then(json => {
            console.log(json.data);
            if (json.data.length < 1) {
                searchScreen.innerHTML = noResults;
                return;
            }
            searchScreen.innerHTML = handleResults(json.data);


            json.data.forEach(entity => {
                const elem = document.querySelector(`#E${entity.entityId}`);
                elem.addEventListener('click', (event) => {
                    console.log(`${event} -- ${entity}`);
                    showDetails(entity);
                }, false);
            });
            // let html = "";
            // json.data.forEach(entity => {
            //     html += `<div class="card">${entity.title}</div>`;
            // });
            // searchScreen.innerHTML = html;
        });
}

const loadingSpinner = `
<div class="spinner-container">
    <svg class="spinner" width="40px" height="40px" viewBox="0 0 66 66"xmlns="http://www.w3.org/2000/svg">
    <circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30">
    </circle>
    </svg>
</div>`;

const noResults = `<strong>No Results Found</strong>`;

function showDetails(entity) {
    const fields = '*';

    // eslint-disable-next-line no-undef
    fetch(`${tokens[2]}entity/${entity.entityType}/${entity.entityId}?fields=${fields}&BhRestToken=${tokens[1]}`)
        .then(response => response.json())
        .then(json => {
            console.log(json.data);
        });
}