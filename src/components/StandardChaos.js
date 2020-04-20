import DrawCard from './DraftData'
import FilterCards from './DraftFilters'

function StandardChaos(props) {
    const { draftCards, draftCard, cardList } = props;
    let newList = []

    newList = newList.concat(cardList)

    // generates all cards, sets cardList state
    const filteredData = FilterCards(props)

    let draftProgress = 0;

    while (draftProgress < draftCards) {
        const card = DrawCard(filteredData)
        newList = draftCard(card, newList)

        if (!card.permanent) draftProgress++
    }

    return newList
}

export default StandardChaos