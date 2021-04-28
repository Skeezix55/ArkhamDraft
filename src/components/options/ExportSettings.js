import React, { useState } from 'react';
import ExportDeck from '../ExportDeck'

function SettingsExport(props) {
    const [useSignatures, changeUseSignatures] = useState([ true, false, false])
    const [basicWeakness, changeBasicWeakness] = useState(['Random basic weakness', '01000'])
    const [deckTitle, changeDeckTitle] = useState('')

    const { investigator, deckSize, cardData, collectionSets, updateCardOverlay } = props
    
    function handleInput(event) {
        changeDeckTitle(event.target.value)
    }

    function handleCheckbox(event) {
        var index = 0

        if (event.target.name === 'CB2') index = 2
        else if (event.target.name === 'CB1') index = 1

        var newSignatures = { ...useSignatures }
        newSignatures[index] = event.target.checked

        changeUseSignatures(newSignatures)
    }

    function onEnterCard(event) {
        // basic weakness
        if (event.target.id === '01000') return

        const cardArray = cardData.filter(item => item.code === event.target.id)

        if (cardArray && cardArray.length > 0) {
            const imagesrc = "http://www.arkhamdb.com" + cardArray[0].imagesrc

            updateCardOverlay(imagesrc, event.clientX)
        }
    }

    function onLeaveCard(event) {
        updateCardOverlay(null, 0)
    }

    function handleWeaknessClick() {
        var weaknessCount = 0

        for (let i = 0; i < weaknessCards.length; i++) {
            weaknessCount += weaknessCards[i].quantity
        }

        var weaknessRoll = Math.floor(Math.random()*weaknessCount)

        for (let i = 0; i < weaknessCards.length; i++) {
            if (weaknessRoll <= 0) {
                changeBasicWeakness([weaknessCards[i].name, weaknessCards[i].code])
                break
            }
            
            weaknessRoll -= weaknessCards[i].quantity
        }
    }

    function handleExportClick(fileType) {
        var specialCards = []

//        for (let i = 0; i < signatureCards.length; i++) {
        for (let [signatureIndex, signatureArray] of signatureCards.entries()) {
            if (useSignatures[signatureIndex]) {
                for (let j = 0; j < signatureArray.length; j++) {
                    const cardID = Object.keys(cardData)
                    .filter(key => {
                        return cardData[key].code === signatureArray[j]
                    })[0]
                
                    const card = cardData[cardID]
                    let sigQuantity = card.quantity

                    if (card.name === 'Occult Evidence') {
                        if (deckSize === '50') sigQuantity = 3
                        else if (deckSize === '40') sigQuantity = 2
                        else sigQuantity = 1
                    }

                    specialCards.push({name: card.name, key: card.code, type_code: card.type_code, count: sigQuantity })
                }
            }
        }

        const weaknessID = Object.keys(cardData)
        .filter(key => {
            return cardData[key].code === basicWeakness[1]
        })[0]
    
        const weaknessCard = cardData[weaknessID]
        if (!weaknessCard.octgn_id) weaknessCard.octgn_id = ''

        specialCards.push({name: weaknessCard.name, key: weaknessCard.code, type_code: weaknessCard.type_code, count: 1 })

        ExportDeck({
            fileType: fileType,
            deckTitle: deckTitle,
            investigator: props.investigator,
            cardList: props.cardList,
            specialCards: specialCards,
            cardData: props.cardData
        })
    }

    var signatureCards = [ [], [], [] ]

    const investigatorID = Object.keys(cardData)
    .filter(key => {
        return cardData[key].name === investigator
    })[0]

    const investigatorCard = cardData[investigatorID]

    const cardRequirements = investigatorCard.deck_requirements.card
    var useCheckbox = false

    for (let crkey = 0; crkey < Object.keys(cardRequirements).length; crkey++) {
        const requirement = cardRequirements[Object.keys(cardRequirements)[crkey]]

        if (Object.keys(requirement).length > 1) useCheckbox = true

        for (let rkey = 0; rkey < Object.keys(requirement).length; rkey++) {
            signatureCards[rkey].push(requirement[Object.keys(requirement)[rkey]])
        }
    }

    signatureCards.sort( (a1, a2) => {
        if (a1.length > 0) {
            if (a2.length > 0) {
                return parseInt(a1[0]) - parseInt(a2[0])
            }
            else return -1
        }

        return 1
    })

    // make sure it's selected in the collection too
    var weaknessCards = cardData.filter( card => {
        return card.subtype_code === 'basicweakness' && card.code !== '01000' && collectionSets[card.pack_code]
    })

    var signatureOptions = <div>
        {
            signatureCards.map( (item, index) => {
                if (item.length > 0) {
                    const cardList = item.map( code => {
                        var signatureID = Object.keys(cardData)
                        .filter(key => {
                            return cardData[key].code === code
                        })[0]

                        let sigQuantity = cardData[signatureID].quantity

                        if (cardData[signatureID].name === 'Occult Evidence') {
                            if (deckSize === '50') sigQuantity = 3
                            else if (deckSize === '40') sigQuantity = 2
                            else sigQuantity = 1
                        }

                        const quantityText = (sigQuantity > 1) ? ' x' + sigQuantity : ''

                        return (useCheckbox ?
                            <p id={cardData[signatureID].code} key={cardData[signatureID].code} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard}>{cardData[signatureID].name + ' (' + cardData[signatureID].pack_name + ')' + quantityText}</p> :
                            <p id={cardData[signatureID].code} key={cardData[signatureID].code} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard}>{cardData[signatureID].name + quantityText}</p>)
                    })

                    return (useCheckbox ?
                        <div key={index} className="signatureDiv">
                            <span className="signatureLeft">
                                <input type="checkbox" checked={useSignatures[index]} name={"CB" + index} className="signature-checkbox" onChange={handleCheckbox}/>
                            </span>
                            <span className="signatureRight">
                                {cardList}
                            </span>
                        </div>
                        :
                        <div key={index} className="signatureDiv">
                            <span className="signatureCenter">
                                {cardList}
                            </span>
                        </div>
                    )
                }
                else return null
            })
        }
        </div>

    return (
        <div className="settingsDiv">
            <h3 style={{marginBottom: '-5px'}}>Export options</h3>
            <div className="exportsettings">
                <label>Deck title:</label>
                <span className="export-option">
                    <input className="deckName" name="deckName" type='text' value={deckTitle} onChange={handleInput}></input>
                </span>
            </div>
            <div>
                <h4 style={{marginBottom: '5px'}}>Signature cards</h4>
                {signatureOptions}
            </div>
            <div>
                <h4 style={{marginBottom: '5px'}}>Weaknesses</h4>
                <p id={basicWeakness[1]} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard}>{basicWeakness[0]}</p>
                <button className='button-rect button-green button-drawweakness' onClick={ () => handleWeaknessClick()}>Draw weakness</button>
                <div className="description">
                    Export as an OCTGN deck file.  To import a downloaded .o8d deck into ArkhamDB, go to My Decks and click Import Deck, then File.
                </div>
            </div>
            <div>
                <button className='button-rect button-green button-export' onClick={ () => handleExportClick('OCTGN')}>Export as .o8d</button>
            </div>
        </div>
    )
}
//<button className='button-rect button-green button-export' onClick={ () => handleExportClick('text')}>Export as .txt</button>

export default SettingsExport