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
    triggerSearch(event);
});

function createGroups(collection, total) {
    let html = `<div id="results"><div id="resultsCount">Returned ${total} results</div>`;
    collection.forEach(group => {
        console.log(group);
        if (group.entities.length > 0) {

            html += `<button class="collapsible">${group.niceName}</button><div class="content" style="display: none">`;
            group.entities.forEach(entity => {
                html += `<button href="#${entity.entityId}" id="E${entity.entityId}">${entity.title}</button><br>`;
            });
            html += '</div>';
        }
    });
    html += '</div>';
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

    return createGroups(sorted, data.length);
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

function triggerSearch(event) {
    event.preventDefault();
    if (!tokens[1]) {
        console.log('RestToken invalid refreshing');
        refresh(tokens[0]);
    }

    const term = document.querySelector('#searchTerm').value;
    const searchPane = document.querySelector('#screen-search');
    searchPane.innerHTML = loadingSpinner;
    scrollToPanel(searchPane);

    search(term, searchPane);
}

const loadingSpinner = `
<div class="spinner-container">
    <svg class="spinner" width="40px" height="40px" viewBox="0 0 66 66"xmlns="http://www.w3.org/2000/svg">
    <circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30">
    </circle>
    </svg>
</div>`;

const noResults = `<strong>No Results Found</strong>`;

function search(term, searchPane) {
    console.log(term);
    if (!term){
        console.log(`search term is invalid? = "${term}"`);
        searchPane.innerHTML = noResults;
        return;
    }
    // eslint-disable-next-line no-undef
    fetch(`${tokens[2]}find?query=${term}&BhRestToken=${tokens[1]}`)
        .then(response => response.json())
        .then(json => {
            console.log(json.data);
            if (json.data.length < 1) {
                searchPane.innerHTML = noResults;
                return;
            }
            searchPane.innerHTML = handleResults(json.data);
            json.data.forEach(entity => {
                const elem = document.querySelector(`#E${entity.entityId}`);
                elem.addEventListener('click', (event) => {
                    console.log(`${event} -- ${entity}`);
                    showDetails(entity);
                }, false);
            });
            const coll = document.getElementsByClassName("collapsible");
            coll[0].children.length;
            for (let i = 0; i < coll.length; i++) {
                coll[i].addEventListener("click", function () {
                    this.classList.toggle("active");
                    const content = this.nextElementSibling;
                    content.style.display = content.style.display == 'none' ? 'block' : 'none';
                });
            }
        });
}

function showDetails(findEntity) {
    const fields = '*';
    const detailsPane = document.querySelector('#screen-entity');
    detailsPane.innerHTML = loadingSpinner;
    scrollToPanel(detailsPane);

    // eslint-disable-next-line no-undef
    getDetails(findEntity, fields, detailsPane);
}

function getDetails(findEntity, fields, detailsPane) {
    // eslint-disable-next-line no-undef
    fetch(`${tokens[2]}entity/${findEntity.entityType}/${findEntity.entityId}?fields=${fields}&BhRestToken=${tokens[1]}`)
        .then(response => response.json())
        .then(json => {
            const entity = json.data;
            console.log(entity);
            detailsPane.innerHTML = `<div id="innerDetails">
                <div class="entityTitle">
                    <h2>${entity.name}</h3>
                    <p>${findEntity.entityType}</p>
                </div>
                <div id="notesOuter">
                </div>
            </div>`;

            getNotes(entity, findEntity);

            const backButton = document.querySelector('#backButton');
            backButton.style.display = 'block';
            backButton.addEventListener('click', (event) => {
                console.log(event);
                scrollToPanel(document.querySelector('#screen-search'));
                const backButton = document.querySelector('#backButton');
                backButton.style.display = 'none';
            });
        });
}

function getNotes(entity, findEntity) {
    fetch(`${tokens[2]}query/NoteEntity?where=targetEntityID=${entity.id}&fields=note&BhRestToken=${tokens[1]}`)
        .then(response => response.json())
        .then(json => {
            // console.log(json.data);
            const notesArea = document.querySelector('#notesOuter');
            notesArea.innerHTML += '<h3 id="notesTitle">Notes</h3><div id="notesInner"></div>';
            if (json.data.length > 0) {
                const noteIds = json.data.map(note => note.note.id).join(',');
                console.error(noteIds);
                // eslint-disable-next-line no-undef
                fetch(`${tokens[2]}entity/Note/${noteIds}?fields=*&BhRestToken=${tokens[1]}`)
                    .then(response => response.json())
                    .then(json => {
                        const notesInner = document.querySelector('#notesInner');
                        notesInner.innerHTML = json.data
                            .map(note => `<div class="note collapsedNote"><div class="noteHeader">
                                        <p>${note.action}</p>
                                        <p>${new Date(note.dateAdded).toJSON().slice(0, 10).split('/').reverse().join('-')}</p>
                                    </div>
                                    <div class="noteBody" style="display: none;">
                                        ${note.comments}
                                    </div>
                                </div>`)
                            .join('\n');
                    });
            } else {
                document.querySelector('#notesInner').innerHTML = '<p>No notes on entity, why not create one?</p>';
            }
            addCommentSection(notesArea, findEntity);
        });
}

function addCommentSection(notesArea, refreshEntity) {
    // eslint-disable-next-line no-undef
    fetch(`${tokens[2]}settings/commentActionList,userId?BhRestToken=${tokens[1]}`)
        .then(response => response.json())
        .then(json => {
            // const actions = 
            notesArea.innerHTML += `<div id="notesInput">
                    <form id="notesInputForm">
                        <input type="text" id="comment" name="comment" placeholder="Notes go here">
                        <select id="actionSelector"></select>
                        <input type="hidden" id="userId" name="userId" value="${json.userId}">
                        <input type="hidden" id="entityId" name="entityId" value="${refreshEntity.entityId}">
                        <button type="submit">Submit</button>
                    </form>
                    </div>`;
            const notesInput = document.querySelector('#notesInputForm');
            notesInput.addEventListener('submit', (event) => {
                submitNote(event, refreshEntity);
            });
            const actionSelector = document.querySelector('#actionSelector');
            actionSelector.innerHTML = json.commentActionList
                .map(action => `<option value="${action}">${action}</option>`)
                .join('\n');
        })
}

function scrollToPanel(panel) {
    const left = panel.offsetLeft;
    // eslint-disable-next-line no-undef
    screens.scroll(left, 0);
}

async function submitNote(event, refreshEntity) {
    event.preventDefault();
    const comment = document.querySelector("#comment").value;
    const action = document.querySelector('#actionSelector').value;
    const user = document.querySelector('#userId').value;
    const entity = document.querySelector('#entityId').value;

    console.log(comment);

    fetch(`/gleecall.api/backend?comment=${comment}&action=${action}&userId=${user}&entityId=${entity}`)
        .then(response => response.json())
        .then(json => {
            console.log(json);
            showDetails(refreshEntity);
        });
}

const searchTerm = getQueryParams(document.location.search);
console.log(searchTerm.term);

if (searchTerm.term){
    search(searchTerm.term, document.querySelector('#screen-search'));
    document.querySelector('#searchTerm').value = searchTerm.term;
}

// screens.addEventListener("scroll", pageTransition);
// tester.addEventListener('click', swoop);

function getQueryParams(qs) {
    qs = qs.split('+').join(' ');

    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}