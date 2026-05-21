// A custom script that uses the COBBLE.js engine to create an amazing platforming game! This is where you can write your game-specific code, like creating entities, handling input, etc.

import * as THREE from "three";

import Cobble from "../COBBLE/main.js";
import EntityManager from "../COBBLE/plugins/entityManager.js";
import Camera from "../COBBLE/plugins/camera.js";

const cobble = new Cobble();
const entityManager = new EntityManager();

cobble.addPlugin(entityManager);

let ground = entityManager.addBox();
ground._visual.scale.set(5, 1, 5000);
ground.entity.position.y = -0.5;

ground._visual.material.roughness = 1;
ground.applyTexture("./COBBLE/assets/minecraft/blocks/chiseled_stone_bricks.png", 5, 5000);
ground.applyLightmap("./COBBLE/assets/minecraft/blocks/chiseled_stone_bricks.png", 5, 5000);


function createPlayer(color = 0xff0000) {
    // main hit box
    const player = entityManager.addBox();
    player._visual.material.transparent = true;
    player._visual.material.opacity = 0;
    player.setScale({x: 0.5, y: 2, z: 0.5});



    const torso = entityManager.addBox();
    torso.setScale({x: 0.5, y: 0.7, z: 0.3});
    torso.applyMaterial(new THREE.MeshStandardMaterial({color}));
    torso.entity.position.y = 0.125;
    player.attachEntity(torso);

    const neck = entityManager.addBox();
    neck.setScale({x: 0.1, y: 0.1, z: 0.1});
    neck.applyMaterial(new THREE.MeshStandardMaterial({color}));
    neck.entity.position.y = 0.35;
    neck.entity.rotation.order = "YXZ";
    neck.entity.rotation.x = 0;
    neck.entity.rotation.y = 0;

    torso.attachEntity(neck);

    const head = entityManager.addBox();
    head.setScale({x: 0.5, y: 0.5, z: 0.5});
    head.applyMaterial(new THREE.MeshStandardMaterial({color}));
    head.entity.position.y = 0.3;
    neck.attachEntity(head);





    const leftElbow = entityManager.addBox();
    leftElbow.setScale({x: 0, y: 0, z: 0});
    leftElbow.entity.position.x = -0.35;
    leftElbow.entity.position.y = 0.25;
    leftElbow.entity.rotation.x = 0;
    torso.attachEntity(leftElbow);

    const leftArm = entityManager.addBox();
    leftArm.setScale({x: 0.2, y: 0.8, z: 0.2});
    leftArm.applyMaterial(new THREE.MeshStandardMaterial({color}));
    leftArm.entity.position.y = -0.3;
    leftElbow.attachEntity(leftArm);





    const rightElbow = entityManager.addBox();
    rightElbow.setScale({x: 0, y: 0, z: 0});
    rightElbow.entity.position.x = 0.35;
    rightElbow.entity.position.y = 0.25;
    rightElbow.entity.rotation.x = 0;
    torso.attachEntity(rightElbow);

    const rightArm = entityManager.addBox();
    rightArm.setScale({x: 0.2, y: 0.8, z: 0.2});
    rightArm.applyMaterial(new THREE.MeshStandardMaterial({color}));
    rightArm.entity.position.y = -0.3;
    rightElbow.attachEntity(rightArm);




    const leftHip = entityManager.addBox();
    leftHip.setScale({x: 0, y: 0, z: 0});
    leftHip.entity.position.x = -0.12;
    leftHip.entity.position.y = -0.4;
    leftHip.entity.rotation.x = 0;
    torso.attachEntity(leftHip);

    const leftLeg = entityManager.addBox();
    leftLeg.setScale({x: 0.25, y: 0.8, z: 0.25});
    leftLeg.applyMaterial(new THREE.MeshStandardMaterial({color}));
    leftLeg.entity.position.y = -0.3;
    leftHip.attachEntity(leftLeg);





    const rightHip = entityManager.addBox();
    rightHip.setScale({x: 0, y: 0, z: 0});
    rightHip.entity.position.x = 0.12;
    rightHip.entity.position.y = -0.4;
    rightHip.entity.rotation.x = 0;
    torso.attachEntity(rightHip);

    const rightLeg = entityManager.addBox();
    rightLeg.setScale({x: 0.25, y: 0.8, z: 0.25});
    rightLeg.applyMaterial(new THREE.MeshStandardMaterial({color}));
    rightLeg.entity.position.y = -0.3;
    rightHip.attachEntity(rightLeg);


    player.leftArm = leftArm;
    player.rightArm = rightArm;
    player.leftElbow = leftElbow;
    player.rightElbow = rightElbow;
    player.leftHip = leftHip;
    player.rightHip = rightHip;
    player.torso = torso;
    player.head = head;
    player.neck = neck;
    
    return player;
}

const player = createPlayer();
player.velocity.z = 5; 
player.entity.position.y = 1;

const playerOne = new Camera(null, player.entity);
cobble.addPlugin(playerOne);
playerOne.mode = "Orbit";
playerOne.offset.x = 3;
playerOne.offset.y = 0.5;

let walkTime = 0;

setInterval(() => {
    playerOne.orbitAngle -= 0.002;  // increment each frame in your game loop

    

    // inside your update or wherever you tick the player:
    walkTime += 0.1;

    const swing = Math.sin(walkTime * 1.5) * 1.3; // 6 = speed, 0.6 rad ≈ 34°

    player.leftElbow.entity.rotation.x  =  swing;
    player.rightElbow.entity.rotation.x = -swing;
    player.leftHip.entity.rotation.x    = -swing;
    player.rightHip.entity.rotation.x   =  swing;
}, 10);


console.log(cobble);