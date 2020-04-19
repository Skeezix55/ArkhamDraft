import React from 'react'

import './App.css';

import InvestigatorSettings from './components/InvestigatorSettings'
import Settings from './components/Settings'

import DraftBuild from './components/DraftBuild'

function App(props) {
    let contents = null

    if (props.fetchError) {
        contents = 
            <div>
                Fetch error!
            </div>
    }
    else if (props.building) {
        contents = 
            <DraftBuild
                draftType={props.draftType}
                investigator={props.investigator} 
                secondaryClass={props.secondaryClass} 
                deckSize={props.deckSize}
                draftCount={props.draftCount[props.phase-1]}
                draftCards={props.draftCards[props.phase-1]}
                cardCount={props.cardCount}
                phase={props.phase}
                cardList={props.cardList}
                cardData={props.cardData}
                draftPool={props.draftPool}
                draftCard={props.draftCard}
                updateCardList={props.updateCardList}
                updateDraftPool={props.updateDraftPool}
                resetApp={props.resetApp}
            />
    }
    else {
        contents = 
        <div>
            <InvestigatorSettings 
                investigator={props.investigator} 
                secondaryClass={props.secondaryClass} 
                deckSize={props.deckSize} 
                onChangeSetting={props.handleChange}
            />
            <Settings
                draftTab={props.draftTab} 
                draftType={props.draftType} 
                draftCount={props.draftCount}
                draftCards={props.draftCards}
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
        </div>
    )
}

export default App;
