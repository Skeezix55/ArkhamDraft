import React from 'react'

import SettingsPhase from './SettingsPhase'

function SettingsPhasedDraft(props) {
    let limit2 = props.deckSize - props.draftCards[0]
    let limit3 = limit2 - props.draftCards[1]
    let limit4 = limit3 - props.draftCards[2]

    let warningText2 = null
    let warningText3 = null
    let warningStyle2 = {}
    let warningStyle3 = {}
    let warningStyle4 = {}

    if (limit2 < props.draftCards[1]) {
        if (limit2 > 0) warningText2 = "Only " + limit2
        else warningText2 = "No"

        warningStyle2 = {display: "block"}
    } else {
        warningStyle2 = {display: "none"}
    }

    if (limit3 < props.draftCards[2]) {
        if (limit3 > 0) warningText3 = "Only " + limit3
        else warningText3 = "No"

        warningStyle3 = {display: "block"}
        if (limit3 < 0) limit3 = 0;
    } else {
        warningStyle3 = {display: "none"}
    }

    if (limit4 > 0) {
        warningStyle4 = {display: "block"}
    } else {
        warningStyle4 = {display: "none"}
    }

    function handleChange1(event) {
        props.onChangeSetting(event.target.name + '1', event.target.value)
    }

    function handleChange2(event) {
        props.onChangeSetting(event.target.name + '2', event.target.value)
    }

    function handleChange3(event) {
        props.onChangeSetting(event.target.name + '3', event.target.value)
    }

    return (
        <div className="draftSettingsDraft">
            <SettingsPhase phase="1" draftCount={props.draftCount[0]} draftCards={props.draftCards[0]} maxCards={props.deckSize} onChangeSetting={handleChange1} />
            <SettingsPhase phase="2" draftCount={props.draftCount[1]} draftCards={props.draftCards[1]} maxCards={props.deckSize} onChangeSetting={handleChange2} />
            <SettingsPhase phase="3" draftCount={props.draftCount[2]} draftCards={props.draftCards[2]} maxCards={props.deckSize} onChangeSetting={handleChange3} />
            <div className="warning" style={warningStyle2}>
                <b>Warning:</b> {warningText2} cards will be drawn in Phase 2.
            </div>
            <div className="warning" style={warningStyle3}>
                <b>Warning:</b> {warningText3} cards will be drawn in Phase 3.
            </div>
            <div className="warning" style={warningStyle4}>
                <b>Warning:</b> The final {limit4} cards will be drawn at random.
            </div>
        </div>
    )
}

export default SettingsPhasedDraft
