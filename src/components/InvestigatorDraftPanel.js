import React from 'react'
import { useSelector } from 'react-redux'

import ColorForClass from '../data/ClassColors'

function InvestigatorPanel(props) {
    const cardData = useSelector(state => state.data.cardData)
    const investigatorData = useSelector(state => state.settings.investigatorData)
    const investigator = useSelector(state => state.settings.investigator)

    let investigatorCardImage = null
    let investigatorCardImageBack = null
    
    // handle weirdly rotated ArkhamDB images
    function imageDidLoad(props)
    {
        const { index, event } = props;

        if (event.target.naturalHeight > event.target.naturalWidth) {
            if ( index === 0) event.target.className = 'investigator-image rotatecw'
            else event.target.className = 'investigator-image rotateccw'
        }
    }

    if (cardData) {
        const factionCode = investigatorData.faction_code;
        const classColor = ColorForClass(factionCode)

        if (investigatorData.imagesrc === undefined) {
            investigatorCardImage = <div className="investigator-div-loading" style={{backgroundColor: classColor}}><h3>{investigator}</h3><p>Image not available</p><p><a href={investigatorData.url} target="_blank" rel="noreferrer noopener">View on ArkhamDB</a></p></div>
        }
        else {
            const imagesrc = "https://www.arkhamdb.com" + investigatorData.imagesrc
            investigatorCardImage = <div className="investigator-div" style={{backgroundColor: classColor}}><img className="investigator-image" src={imagesrc} alt={props.investigator} onLoad={event => imageDidLoad({index: 0, event: event})}/></div>
        }

        if (investigatorData.backimagesrc === undefined) {
            investigatorCardImageBack = <div className="investigator-div-loading" style={{backgroundColor: classColor}}><h3>{investigator + ' (Back)'}</h3><p>Image not available</p><p><a href={investigatorData.url} target="_blank" rel="noreferrer noopener">View on ArkhamDB</a></p></div>
        }
        else {
            const backimagesrc = "https://www.arkhamdb.com" + investigatorData.backimagesrc
            investigatorCardImageBack = <div className="investigator-div" style={{backgroundColor: classColor}}><img className="investigator-image" src={backimagesrc} alt={investigator + ' (back)'} onLoad={event => imageDidLoad({index: 1, event: event})}/></div>
        }
    }

    return (
        <div className="settingsDiv">
            <h2>{investigator}</h2>
            <div className="investigator-grid">
                {investigatorCardImage}
                {investigatorCardImageBack}
            </div>
        </div>
    )
}

export default InvestigatorPanel
