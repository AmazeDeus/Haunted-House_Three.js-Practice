import * as THREE from 'three'
import { createDoor } from './door.js'
import { createRoof } from './roof.js'
import { createBushes } from './bushes.js'
import { createLogs } from './logs.js'
import { createWalls } from './walls.js'
import { createWindow } from './window.js'
import { createPentagram } from './pentagram.js'

const createHouse = (): THREE.Group => {
    const houseGroup = new THREE.Group()
    houseGroup.name = 'houseGroup'

    const walls = createWalls()
    houseGroup.add(walls)

    const window = createWindow()
    houseGroup.add(window)

    // Roof
    const roof = createRoof()
    houseGroup.add(roof)

    // Door
    const door = createDoor()
    houseGroup.add(door)

    // Bushes
    createBushes(houseGroup)

    // Logs
    createLogs(houseGroup)

    // Pentagram
    const pentagram = createPentagram()
    houseGroup.add(pentagram)

    return houseGroup
}

export { createHouse }