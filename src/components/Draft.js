import React from 'react'

import CardList from './CardList'
import DraftArea from './DraftArea'

function Draft(props) {
    const { investigator, deckSize, draftTab, draftXP, draftCount, draftProgress, draftType, phase, cardList, draftPool, cardData, draftCard, updateCardList, updateDraftPool, resetApp, updateCardOverlay } = props

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

    const progress = draftTab === 'Build Deck' ? 
        <p><b>Cards: </b>{draftProgress}/{deckSize}</p> : 
        <p><b>XP: </b>{draftProgress}/{draftXP}</p>

    return (
        <div>
            <div className="settings">
                <h2>{investigator}</h2>
                <br />
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
            <button onClick={resetApp}>Restart</button>
        </div>
    )
}

export default Draft