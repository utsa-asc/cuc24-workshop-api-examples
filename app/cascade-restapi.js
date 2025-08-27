/* Step 1: Add the workshop cms URL*/
const cmsUrl = "https://walledev.it.utsa.edu/";
/* Step 2: Create and add your cascade API Key. */
// Note: Additional details on API Setup found here- https://www.hannonhill.com/cascadecms/latest/cascade-basics/account-settings.html#APIKey*/
const cmsAPI = "c8186003-cc60-4eb3-a581-ae7330fe2f66";
// Note: If you get the error "The requested asset does not exist" and you're not trying to access an existing asset, please double check your API Key.
/* Step 3: Save */

const headers = { "Authorization": "Bearer " + cmsAPI };

function readAsset(a) {
    if (a.type == "user") {
        var url = cmsUrl + "api/v1/read/" + a.type + "/" + a.path;
    } else if (a.path) {
        var url = cmsUrl + "api/v1/read/" + a.type + "/" + a.siteName + "/" + a.path;
    } else if (a.id) {
        var url = cmsUrl + "api/v1/read/" + a.type + "/" + a.id;
    }
    url = url.replace(/\\\\/g, "\\");
    if (a.debug) {
        console.log("Fetch URL " + url);
    }
    return new Promise(function(resolve, reject) {
        fetch(url, { headers: headers })
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    resolve({ read_status: "Success", sent: a, apiReturn: data, url: url });
                } else {
                    reject({ read_status: "Error", error: data.message, sent: a, apiReturn: data, url: url });
                }
            });
    });
}

function editAsset(a) {
    return new Promise(function(resolve, reject) {
        fetch(cmsUrl + "api/v1/edit", { method: "POST", headers: headers, body: JSON.stringify({ asset: a.asset.asset }), })
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    resolve({ edit_status: "Success", sent: a, apiReturn: data });
                } else {
                    reject({ edit_status: "Error", error: data.message, sent: a, apiReturn: data });
                }
            });
    });
}

function copyAsset(a) {
    if (a.path) {
        var url = cmsUrl + "api/v1/copy/" + a.type + "/" + a.siteName + "/" + a.path;
    } else if (a.id) {
        var url = cmsUrl + "api/v1/copy/" + a.type + "/" + a.id;
    }
    url = url.replace(/\\\\/g, "\\");
    return new Promise(function(resolve, reject) {
        fetch(url, { method: "POST", headers: headers, body: JSON.stringify({ copyParameters: a.copyParameters }), })
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    resolve({ copy_status: "Success", sent: a, apiReturn: data, url: url });
                } else {
                    reject({ copy_status: "Error", error: data.message, sent: a, apiReturn: data, url: url });
                }
            });
    });
}

function moveAsset(a) {
    if (a.path) {
        var url = cmsUrl + "api/v1/move/" + a.type + "/" + a.siteName + "/" + a.path;
    } else if (a.id) {
        var url = cmsUrl + "api/v1/move/" + a.type + "/" + a.id;
    }
    url = url.replace(/\\\\/g, "\\");
    return new Promise(function(resolve, reject) {
        fetch(url, { method: "POST", headers: headers, body: JSON.stringify({ moveParameters: a.moveParameters }), })
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    resolve({ move_status: "Success", sent: a, apiReturn: data, url: url });
                } else {
                    reject({ move_status: "Error", error: data.message, sent: a, apiReturn: data, url: url });
                }
            });
    });
}

function deleteAsset(a) {
    if (a.path) {
        var url = cmsUrl + "api/v1/delete/" + a.type + "/" + a.siteName + "/" + a.path;
    } else if (a.id) {
        var url = cmsUrl + "api/v1/delete/" + a.type + "/" + a.id;
    }
    url = url.replace(/\\\\/g, "\\");
    return new Promise(function(resolve, reject) {
        fetch(url, { method: "POST", headers: headers })
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    resolve({ delete_status: "Success", sent: a, apiReturn: data, url: url });
                } else {
                    reject({ delete_status: "Error", error: data.message, sent: a, apiReturn: data, url: url });
                }
            });
    });
}

function createAsset(a) {
    return new Promise(function(resolve, reject) {
        fetch(cmsUrl + "api/v1/create", { method: "POST", headers: headers, body: JSON.stringify({ asset: a.asset }), })
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    resolve({ create_status: "Success", sent: a, apiReturn: data });
                } else {
                    reject({ create_status: "Error", error: data.message, sent: a, apiReturn: data });
                }
            });
    });
}

function listSubscribers(a) {
    if (a.path) {
        var url = cmsUrl + "api/v1/listSubscribers/" + a.type + "/" + a.siteName + "/" + a.path;
    } else if (a.id) {
        var url = cmsUrl + "api/v1/listSubscribers/" + a.type + "/" + a.id;
    }
    url = url.replace(/\\\\/g, "\\");
    if (a.debug) {
        console.log("Fetch URL " + url);
    }
    return new Promise(function(resolve, reject) {
        fetch(url, { headers: headers })
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    resolve({ listSubscribers_status: "Success", sent: a, apiReturn: data, url: url });
                } else {
                    reject({ listSubscribers_status: "Error", error: data.message, sent: a, apiReturn: data, url: url });
                }
            });
    });
}

function listSites(a) {
    return new Promise(function(resolve, reject) {
        fetch(cmsUrl + "api/v1/listSites", { headers: headers })
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    resolve({ listSites_status: "Success", sent: a, apiReturn: data });
                } else {
                    reject({ listSites_status: "Error", error: data.message, sent: a, apiReturn: data });
                }
            });
    });
}

function copySite(a) {
    return new Promise(function(resolve, reject) {
        fetch(cmsUrl + "api/v1/siteCopy", { method: "POST", headers: headers, body: JSON.stringify(a), })
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    resolve({ edit_status: "Success", sent: a, apiReturn: data });
                } else {
                    reject({ edit_status: "Error", error: data.message, sent: a, apiReturn: data });
                }
            });
    });
}