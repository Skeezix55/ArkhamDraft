import React from 'react'
import { useSelector } from 'react-redux'

import { costWithTaboo } from '../draft/DrawDraft'
import useCardOverlay from './OverlayImage'

function CardListPanel(props) {
    const cardList = props.list
    const cardData = useSelector(state => state.data.cardData)
    const deckName = useSelector(state => state.draft.deckName)

    let assetCount = 0  
    let eventCount = 0
    let skillCount = 0
    let otherCount = 0
    const hand = []
    const hand2 = []
    const arcane = []
    const arcane2 = []
    const accessory = []
    const body = []
    const ally = []
    const tarot = []
    const otherasset = []
    const permanent = []
    const event = []
    const skill = []
    const other = []

    cardList.forEach(item => {
        if (item.type_code === 'event') {
            event.push(item)
            eventCount += item.count
        }
        else if (item.type_code === 'skill') {
            skill.push(item)
            skillCount += item.count
        }
        else if (item.type_code === 'asset') {
            if (item.permanent) permanent.push(item)
            else if (item.slot === 'Hand') hand.push(item)
            else if (item.slot === 'Hand x2') hand2.push(item)
            else if (item.slot === 'Arcane') arcane.push(item)
            else if (item.slot === 'Arcane x2') arcane2.push(item)
            else if (item.slot === 'Accessory') accessory.push(item)
            else if (item.slot === 'Body') body.push(item)
            else if (item.slot === 'Ally') ally.push(item)
            else if (item.slot === 'Tarot') tarot.push(item)
            else otherasset.push(item)
            assetCount += item.count
        }
        else {
            other.push(item)
            otherCount += item.count
        }
    })

    const doCardOverlay = useCardOverlay()

    function onEnterCard(event) {
        const cardArray = cardData.filter(item => item.code === event.target.id)

        if (cardArray && cardArray.length > 0 && cardArray[0].imagesrc) {
            doCardOverlay(cardArray[0].imagesrc, event.clientX)
        }
    }

    function onLeaveCard(event) {
        doCardOverlay(null, 0)
    }

    const assetHeader = assetCount > 0 ? <h4>Assets ({assetCount})</h4> : null
    
    const handHeader = hand.length > 0 ? <p className='slot-header'>Hand</p> : null
    const handContents = hand.sort((a, b) => (a.name > b.name) ? 1 : ((a.name === b.name) ? a.xp - b.xp : -1)).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null
        const levelStr = item.xp && item.xp > 0 ? <span className='xpDots'>{' ' + '\u25CF'.repeat(costWithTaboo(item))}</span> : null

        return <p className='cardlist-item' id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{levelStr}{countStr}</p>
    })

    const hand2Header = hand2.length > 0 ? <p className='slot-header'>Hand x2</p> : null
    const hand2Contents = hand2.sort((a, b) => (a.name > b.name) ? 1 : ((a.name === b.name) ? a.xp - b.xp : -1)).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null
        const levelStr = item.xp && item.xp > 0 ? <span className='xpDots'>{' ' + '\u25CF'.repeat(costWithTaboo(item))}</span> : null

        return <p className='cardlist-item' id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{levelStr}{countStr}</p>
    })

    const arcaneHeader = arcane.length > 0 ? <p className='slot-header'>Arcane</p> : null
    const arcaneContents = arcane.sort((a, b) => (a.name > b.name) ? 1 : ((a.name === b.name) ? a.xp - b.xp : -1)).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null
        const levelStr = item.xp && item.xp > 0 ? <span className='xpDots'>{' ' + '\u25CF'.repeat(costWithTaboo(item))}</span> : null

        return <p className='cardlist-item' id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{levelStr}{countStr}</p>
    })

    const arcane2Header = arcane2.length > 0 ? <p className='slot-header'>Arcane x2</p> : null
    const arcane2Contents = arcane2.sort((a, b) => (a.name > b.name) ? 1 : ((a.name === b.name) ? a.xp - b.xp : -1)).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null
        const levelStr = item.xp && item.xp > 0 ? <span className='xpDots'>{' ' + '\u25CF'.repeat(costWithTaboo(item))}</span> : null

        return <p className='cardlist-item' id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{levelStr}{countStr}</p>
    })

    const accessoryHeader = accessory.length > 0 ? <p className='slot-header'>Accessory</p> : null
    const accessoryContents = accessory.sort((a, b) => (a.name > b.name) ? 1 : ((a.name === b.name) ? a.xp - b.xp : -1)).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null
        const levelStr = item.xp && item.xp > 0 ? <span className='xpDots'>{' ' + '\u25CF'.repeat(costWithTaboo(item))}</span> : null

        return <p className='cardlist-item' id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{levelStr}{countStr}</p>
    })

    const bodyHeader = body.length > 0 ? <p className='slot-header'>Body</p> : null
    const bodyContents = body.sort((a, b) => (a.name > b.name) ? 1 : ((a.name === b.name) ? a.xp - b.xp : -1)).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null
        const levelStr = item.xp && item.xp > 0 ? <span className='xpDots'>{' ' + '\u25CF'.repeat(costWithTaboo(item))}</span> : null

        return <p className='cardlist-item' id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{levelStr}{countStr}</p>
    })

    const allyHeader = ally.length > 0 ? <p className='slot-header'>Ally</p> : null
    const allyContents = ally.sort((a, b) => (a.name > b.name) ? 1 : ((a.name === b.name) ? a.xp - b.xp : -1)).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null
        const levelStr = item.xp && item.xp > 0 ? <span className='xpDots'>{' ' + '\u25CF'.repeat(costWithTaboo(item))}</span> : null

        return <p className='cardlist-item' id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{levelStr}{countStr}</p>
    })

    const tarotHeader = tarot.length > 0 ? <p className='slot-header'>Tarot</p> : null
    const tarotContents = tarot.sort((a, b) => (a.name > b.name) ? 1 : ((a.name === b.name) ? a.xp - b.xp : -1)).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null
        const levelStr = item.xp && item.xp > 0 ? <span className='xpDots'>{' ' + '\u25CF'.repeat(costWithTaboo(item))}</span> : null

        return <p className='cardlist-item' id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{levelStr}{countStr}</p>
    })

    const otherassetHeader = otherasset.length > 0 ? <p className='slot-header'>Other</p> : null
    const otherassetContents = otherasset.sort((a, b) => (a.name > b.name) ? 1 : ((a.name === b.name) ? a.xp - b.xp : -1)).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null
        const levelStr = item.xp && item.xp > 0 ? <span className='xpDots'>{' ' + '\u25CF'.repeat(costWithTaboo(item))}</span> : null

        return <p className='cardlist-item' id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{levelStr}{countStr}</p>
    })

    const permanentHeader = permanent.length > 0 ? <p className='slot-header'>Permanent</p> : null
    const permanentContents = permanent.sort((a, b) => (a.name > b.name) ? 1 : ((a.name === b.name) ? a.xp - b.xp : -1)).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null
        const levelStr = item.xp && item.xp > 0 ? <span className='xpDots'>{' ' + '\u25CF'.repeat(costWithTaboo(item))}</span> : null

        return <p className='cardlist-item' id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{levelStr}{countStr}</p>
    })

    const eventHeader = eventCount > 0 ? <h4>Events ({eventCount})</h4> : null
    const eventContents = event.sort((a, b) => (a.name > b.name) ? 1 : ((a.name === b.name) ? a.xp - b.xp : -1)).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null
        const levelStr = item.xp && item.xp > 0 ? <span className='xpDots'>{' ' + '\u25CF'.repeat(costWithTaboo(item))}</span> : null

        return <p className='cardlist-item' id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{levelStr}{countStr}</p>
    })

    const skillHeader = skillCount > 0 ? <p className='slot-header'>Skills ({skillCount})</p> : null
    const skillContents = skill.sort((a, b) => (a.name > b.name) ? 1 : ((a.name === b.name) ? a.xp - b.xp : -1)).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null
        const levelStr = item.xp && item.xp > 0 ? <span className='xpDots'>{' ' + '\u25CF'.repeat(costWithTaboo(item))}</span> : null

        return <p className='cardlist-item' id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{levelStr}{countStr}</p>
    })

    const otherHeader = otherCount > 0 ? <h4>Other ({otherCount})</h4> : null
    const otherContents = other.sort((a, b) => (a.name > b.name) ? 1 : ((a.name === b.name) ? a.xp - b.xp : -1)).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null
        const levelStr = item.xp && item.xp > 0 ? <span className='xpDots'>{' ' + '\u25CF'.repeat(costWithTaboo(item))}</span> : null

        return <p className='cardlist-item' id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{levelStr}{countStr}</p>
    })

    const header = props.deck ?
        <h3>{deckName.length > 0 ? deckName : 'Deck'}</h3> :
        props.removed ? <h3>Removed List</h3> :
        <h3>Draft List</h3>

    const subheader = props.deck ?
        <h5>Deck List</h5>:
        null

    const bottomText = props.removed ? <p style={{fontSize: '8pt', marginTop: '5px'}}>Cards in this list will not be removed from the deck or draft list, to keep original deck and record of drafts intact.</p> : null

    return (
        <div className="settingsDiv">
            {header}
            {subheader}
            <div className="list-container">
                <div className="col1">
                    {assetHeader}
                    {handHeader}
                    {handContents}
                    {hand2Header}
                    {hand2Contents}
                    {arcaneHeader}
                    {arcaneContents}
                    {arcane2Header}
                    {arcane2Contents}
                    {accessoryHeader}
                    {accessoryContents}
                    {bodyHeader}
                    {bodyContents}
                    {allyHeader}
                    {allyContents}
                    {tarotHeader}
                    {tarotContents}
                    {otherassetHeader}
                    {otherassetContents}
                    {permanentHeader}
                    {permanentContents}
                </div>
                <div className="col2">
                    {eventHeader}
                    {eventContents}
                    {skillHeader}
                    {skillContents}
                    {otherHeader}
                    {otherContents}
                </div>
            </div>
            <div>{bottomText}</div>
        </div>
    )
}

export default CardListPanel