import React from 'react'

import CardList from './CardList'
import DraftArea from './DraftArea'
import ExportSettings from '../options/ExportSettings'

function Draft(props) {
    const { investigator, deckSize, draftTab, draftXP, draftCount, draftProgress, draftType, phase, cardList, draftPool, cardData, draftCard, updateCardList, updateDraftPool, resetApp, collectionSets, updateCardOverlay } = props

    let investigatorCardImage = null
    let investigatorCardImageBack = null
        
    if (cardData) {
        const investigatorID = Object.keys(cardData)
        .filter(key => {
            return  cardData[key].name === investigator
        })[0]

        const imagesrc = "https://www.arkhamdb.com" + cardData[investigatorID].imagesrc
        const backimagesrc = "https://www.arkhamdb.com" + cardData[investigatorID].backimagesrc
        investigatorCardImage = <img className="investigator-image" src={imagesrc} alt={props.investigator} />
        investigatorCardImageBack = <img className="investigator-image" src={backimagesrc} alt={props.investigator + ' (back)'} />
    }

    let draftContent = null
    let exportContent = null

    if (draftPool.length > 0) {
        draftContent = <DraftArea 
            draftCount={draftCount}
            draftCard={draftCard}
            phase={phase}
            draftType={draftType}
            draftPool={draftPool}
            cardList={cardList}
            updateCardList={updateCardList}
            updateDraftPool={updateDraftPool}
        />
    }
    else if (draftTab === 'Build Deck') {
        exportContent = <ExportSettings
            investigator={investigator}
            deckSize={deckSize}
            cardList={cardList}
            cardData={cardData}
            collectionSets={collectionSets}
            updateCardOverlay={updateCardOverlay}
        />
    }

    const progress = draftTab === 'Build Deck' ? 
        <p><b>Cards: </b>{draftProgress}/{deckSize}</p> : 
        <p><b>XP: </b>{draftProgress}/{draftXP}</p>

    return (
        <div>
            <div className="settingsDiv">
                <h2>{investigator}</h2>
                {investigatorCardImage}
                {investigatorCardImageBack}
                {progress}
            </div>
            {draftContent}
            <CardList 
                cardList={cardList}
                cardData={cardData}
                updateCardOverlay={updateCardOverlay}
            />
            {exportContent}
            <button className='button-rect button-green' onClick={resetApp}>Restart</button>
        </div>
    )
}

export default Draft