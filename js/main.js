'use strict';
/* global
    marked:readonly
 */

const village = {
    ENDPOINT: 'https://versatileapi.herokuapp.com/api'
};

function _$(id) {
    return document.querySelector(id);
}

// function $$(id) {
//     return document.querySelectorAll(id);
// }

function displayTimeDiff(at) {
    const date = new Date(at);
    const diff = (Date.now() - date) / 1_000;
    let timeDiff = "";
    if (diff < 60) {
        timeDiff = `${parseInt(diff)}秒前`;
    } else if (diff/60 < 60) {
        timeDiff = `${parseInt(diff/60)}分前`;
    } else if (diff/60/60 < 24) {
        timeDiff = `${parseInt(diff/60/60)}時間前`;
    } else {
        timeDiff = `${parseInt(diff/60/60/24)}日前`;
    }
    return timeDiff;
}

function drawTimeline(data) {
    const timeline = _$("#lane-timeline").getElementsByClassName("body")[0];

    timeline.innerText = "";

    for (const entry of data) {
        timeline.insertAdjacentHTML("beforeend" , `
<div class="${entry.id}">
    <div class="text">
        <div class="avatar"
            style="background: #${entry._user_id.slice(0, 6)};
            title="${entry._user_id.replace(/(<\s*script([^>]+)>)/ig, "")}">
            ${entry._user_id.slice(0, 2).toUpperCase()}
        </div>
        <dl>
            <dt>
                <span class="id">@${entry._user_id.replace(/(<\s*script([^>]+)>)/ig, "")}</span>
                <span class="time">${displayTimeDiff(entry._created_at)}</span>
            </dt>
            <dd class="log">${marked(entry.text).replace(/(<\s*script([^>]+)>)/ig, "")}</dd>
        </dl>
    </div>
</div>
`);
    }
}

function getTimeline() {
    fetch(`${village.ENDPOINT}/text/all?$orderby=_created_at desc&$limit=20`)
    .then(response => {
        if (response.status == 200) {
            return response.json();
        }
    })
    .then(jso => {
        drawTimeline(jso);
    })
    .catch(e => {
        console.log(e);
    });
}

function sendMsg() {
    const input = _$("textarea");

    fetch(`${village.ENDPOINT}/text`, {
        method: "POST",
        headers: { Authorization: "HelloWorld" },
        body: JSON.stringify({ text: input.value })
    })
    .then((res) => res.json())
    .then((x) => console.log(x));

    input.value = "";
    getTimeline();
}

window.onload = () => {
    _$('#sendButton').addEventListener("click", () => {
        sendMsg();
    });

    _$('textarea').addEventListener("keydown", e => {
        /// textarea 内で ctrl + Enter で送信
        if (e.ctrlKey && e.keyCode == 13) {
            sendMsg();
        }
    });

    _$('.login').getElementsByClassName('pre')[0].addEventListener("click", () => {
        _$('#certification').classList.toggle("d-none");
    });

    _$('#certificationButton').addEventListener("click", () => {
        if (_$('input').value.trim() == "block") {
            _$('.login').classList.toggle("d-none");
            _$('main').classList.toggle("d-none");
        }
    });

    _$('input').addEventListener("keydown", e => {
        /// input 内で Enter で送信
        if (e.keyCode == 13) {
            _$('#certificationButton').click();
        }
    });

    getTimeline();
    // 10秒に一度リロード
    setInterval(getTimeline, 10_000);
};
