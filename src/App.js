import React, { useState } from 'react'

import './App.css';

import InvestigatorSettings from './components/InvestigatorSettings'
import Settings from './components/Settings'

import Draft from './components/Draft'

function App(props) {
    let contents = null

    const [overlayImage, updateOverlayImage] = useState(null)
    const [overlayPosition, updateOverlayPosition] = useState('Left"')

    function updateCardOverlay(image, position) {
        updateOverlayImage(image)
        updateOverlayPosition(position)
    }

    let overlay = null

    if (overlayImage) {
        overlay = <div className={"floatingImage"+overlayPosition}><img src={overlayImage} alt="" /></div>
    }

    if (props.fetchError) {
        contents = 
            <div>
                Fetch error!
            </div>
    }
    else if (!props.cardData || !props.tabooData) {
        contents =
            <div style={{marginBottom: "20px"}}>
                Loading...
            </div>
    }
    else if (props.building) {
        contents = 
            <Draft
                draftType={props.draftType}
                draftTab={props.draftTab}
                investigator={props.investigator} 
                secondaryClass={props.secondaryClass} 
                deckSize={props.deckSize}
                draftXP={props.draftXP}
                draftCount={props.draftCount[props.phase-1]}
                draftCards={props.draftCards[props.phase-1]}
                draftProgress={props.draftProgress}
                phase={props.phase}
                cardList={props.cardList}
                cardData={props.cardData}
                draftPool={props.draftPool}
                draftCard={props.draftCard}
                updateCardList={props.updateCardList}
                updateDraftPool={props.updateDraftPool}
                updateCardOverlay={updateCardOverlay}
                resetApp={props.resetApp}
            />
    }
    else {
        contents = 
        <div>
            <InvestigatorSettings 
                investigator={props.investigator}
                secondaryClass={props.secondaryClass}
                selectedDeckSize={props.selectedDeckSize}
                selectedTaboo={props.selectedTaboo}
                deckSize={props.deckSize}
                cardData={props.cardData}
                tabooData={props.tabooData}
                onChangeSetting={props.handleChange}
            />
            <Settings
                draftTab={props.draftTab}
                draftType={props.draftType}
                draftWeighting={props.draftWeighting}
                draftXP={props.draftXP}
                draftCount={props.draftCount}
                draftCards={props.draftCards}
                draftUseLimited={props.draftUseLimited}
                deckSize={props.deckSize}
                ready={props.ready}
                onChangeSetting={props.handleChange}
            />
        </div>
    }

    return (
        <div className="App">
            <header className="App-header">
            ArkhamDraft
            </header>
            {contents}
            {overlay}
            <div className="copyright" style={{padding: "5px", boxSizing: "border-box"}}>
                Arkham Horror: The Card Game and all information presented here, both literal and graphical, is copyrighted by Fantasy Flight Games. This website is not produced, endorsed, supported, or affiliated with Fantasy Flight Games.
            </div>
        </div>
    )
}

export default App;
