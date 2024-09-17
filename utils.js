function escapeHTML(str) {

    var tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };
    

    function replaceTag(tag) {
        return tagsToReplace[tag] || tag;
    }

    return String(str).replace(/[&<>]/g, replaceTag);
}

function isElectron(){
    return (typeof process != 'undefined' && process.versions.hasOwnProperty('electron'));
}