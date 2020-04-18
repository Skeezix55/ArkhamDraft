import DrawCard from './DraftData'
import FilterCards from './DraftFilters'

function StandardChaos(props) {
    const { draftCards, draftCard, cardList } = props;
    let newList = []

    newList = newList.concat(cardList)

    // generates all cards, sets cardList state
    const filteredData = FilterCards(props)

    for (let i = 0; i < draftCards; i++) {
        const card = DrawCard(filteredData)
        newList = draftCard(card, newList)
    }

    return newList
}

export default StandardChaos