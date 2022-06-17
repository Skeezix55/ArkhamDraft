const DraftPhases = {
    AllCards: 0,
    BuildPhase1: 1,
    BuildPhase2: 2,
    BuildPhase3: 3,
    BuildUpgradePhase:  4,
//    UpgradeLevel0SwapPhase: 5,
    UpgradeLevel0AddPhase: 6,
    UpgradePhase: 7,
    VersatilePhase: 8
}

export function isUpgrade(phase) {
    switch (phase) {
        case DraftPhases.AllCards:
        case DraftPhases.BuildUpgradePhase:
        case DraftPhases.UpgradePhase:
            return true
        default:
            break
    }

    return false
}

export function isLevel0Upgrade(phase) {
    switch (phase) {
        case DraftPhases.UpgradeLevel0SwapPhase:
        case DraftPhases.UpgradeLevel0AddPhase:
        case DraftPhases.VersatilePhase:
            return true
        default:
        break
    }

    return false
}

export function isLevel0Build(phase) {
    switch (phase) {
        case DraftPhases.BuildPhase1:
        case DraftPhases.BuildPhase2:
        case DraftPhases.BuildPhase3:
            return true
        default:
            break
    }

    return false
}

export default DraftPhases