import { useDispatch } from 'react-redux'

import { updateImageOverlay } from '../features/settings/settingsSlice'

function useCardOverlay(imagesrc, xloc) {
    const dispatch = useDispatch()

    return function(imagesrc, clientX) {
        if (imagesrc) {
            const fullimagesrc = "http://www.arkhamdb.com" + imagesrc

            dispatch(updateImageOverlay({ imagesrc: fullimagesrc, position: clientX }))
        }
        else {
            dispatch(updateImageOverlay({ imagesrc: null }))
        }
    }
}

export default useCardOverlay