function ColorForClass(classCode)
{
    const factionCodes = [ 'guardian', 'seeker', 'rogue', 'mystic', 'survivor', 'neutral', 'multiclass' ]
    const factionColors = [ '#c8eeff', '#ffe3c2', '#b6ffd7', '#efd2ff', '#ffd1d5', '#e2e2e2', '#fffedf' ]

    let factionIndex = -1

    for (let f = 0; f < 7; f++) {
        if (classCode === factionCodes[f]) factionIndex = f
    }

    return factionColors[factionIndex]
}

export default ColorForClass