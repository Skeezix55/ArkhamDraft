import DrawCard from './DraftData'
import FilterCards from './DraftFilters'

function SimpleDraft(props) {
    const { draftCount } = props

    // generates draft cards
    const filteredData = FilterCards(props)

    let draftPool = []

    for (let i = 0; i < draftCount; i++) {
        const card = DrawCard(filteredData, draftPool)

        draftPool.push(card)
    }

    return draftPool
}

export default SimpleDraft