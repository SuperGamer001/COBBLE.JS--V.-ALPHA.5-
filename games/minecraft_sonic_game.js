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


function createBasicPlayer(color = 0xff0000) {
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

function createSonicPlayer(character = "sonic") {
    let color = {}
    if (character === "sonic") {
        color = {
            quills: {normal: 0x0000ff, super: 0x00ffff},
            skin: 0xffcc99,
            mouth: 0xbb8855,
            shoes: 0xff0000,
            eyes: 0x00ff00,
        };
    }
    else if (character === "shadow") {
        color = {
            quills: {normal: 0x111111, super: 0x00ffff},
            skin: 0xeebb77,
            mouth: 0xaa7733,
            shoes: 0xffffff,
            eyes: 0xff0000,
        };
    }

    let player, torso, neck, head;
    let muzzle, mouth, nose, eyes, brows, LeftPupil, LeftEyeColor, RightPupil, RightEyeColor, rightEar, leftEar, quills;
    let stomach, leftArm, rightArm, leftSholder, rightSholder, leftElbow, rightElbow, leftHand, rightHand, lowerLeftArm, lowerRightArm;
    let leftHip, rightHip, leftLeg, rightLeg, leftKnee, rightKnee, lowerLeftLeg, lowerRightLeg, leftAnkle, rightAnkle, leftFoot, rightFoot;

    // main hit box
    {
        player = entityManager.addBox();
        player._visual.material.transparent = true;
        player._visual.material.opacity = 0;
        player.setScale({x: 0.8, y: 2, z: 0.8});
    }


    // Torso
    {
        torso = entityManager.addBox();
        torso.setScale({x: 0.35, y: 0.45, z: 0.25});
        torso.applyMaterial(new THREE.MeshStandardMaterial({color: color.quills.normal}));
        torso.entity.position.y = 0.3;
        player.attachEntity(torso);

        stomach = entityManager.addBox();
        stomach.setScale({x: 0.25, y: 0.35, z: 0.001});
        stomach.applyMaterial(new THREE.MeshStandardMaterial({color: color.skin}));
        // stomach.entity.position.y = -0.05;
        stomach.entity.position.z = 0.125;
        torso.attachEntity(stomach);
    }



    // Head Base
    {
        neck = entityManager.addBox();
        neck.setScale({x: 0.1, y: 0.1, z: 0.1});
        neck.applyMaterial(new THREE.MeshStandardMaterial({color: color.quills.normal}));
        neck.entity.position.y = 0.25;
        neck.entity.rotation.order = "YXZ";
        neck.entity.rotation.x = 0;
        neck.entity.rotation.y = 0;
        torso.attachEntity(neck);

        head = entityManager.addBox();
        head.setScale({x: 0.5, y: 0.5, z: 0.25});
        head.applyMaterial(new THREE.MeshStandardMaterial({color: color.quills.normal}));
        head.entity.rotation.order = "YXZ";
        head.entity.position.y = 0.3;
        head.entity.position.z = 0.05;
        neck.attachEntity(head);
    }



    // Sonic's face details
    {
        muzzle = entityManager.addBox();
        muzzle.setScale({x: 0.52, y: 0.15, z: 0.1});
        muzzle.applyMaterial(new THREE.MeshStandardMaterial({color: color.skin}));
        muzzle.entity.position.z = 0.09;
        muzzle.entity.position.y = -0.18;
        head.attachEntity(muzzle);

        mouth = entityManager.addBox(); // mouth
        mouth.setScale({x: 0.1, y: 0.05, z: 0.1});
        mouth.applyMaterial(new THREE.MeshStandardMaterial({color: color.mouth}));
        mouth.entity.position.z = 0.091;
        mouth.entity.position.y = -0.17;
        mouth.entity.position.x = 0.1;
        head.attachEntity(mouth);

        nose = entityManager.addBox();
        nose.setScale({x: 0.04, y: 0.04, z: 0.2});
        nose.applyMaterial(new THREE.MeshStandardMaterial({color: 0x000000}));
        nose.entity.position.z = 0.08;
        nose.entity.position.y = -0.12;
        nose.entity.rotation.x = -0.2;
        head.attachEntity(nose);

        eyes = entityManager.addBox();
        eyes.setScale({x: 0.51, y: 0.25, z: 0.1});
        eyes.applyMaterial(new THREE.MeshStandardMaterial({color: 0xffffff}));
        eyes.entity.position.z = 0.08;
        eyes.entity.position.y = 0.01;
        head.attachEntity(eyes);

        brows = entityManager.addBox();
        brows.setScale({x: 0.1, y: 0.2, z: 0.1});
        brows.applyMaterial(new THREE.MeshStandardMaterial({color: color.quills.normal}));
        brows.entity.position.z = 0.084;
        brows.entity.rotation.x = -0.1;
        brows.entity.position.y = 0.1;
        head.attachEntity(brows);
    }


    // Eye details
    {
        LeftPupil = entityManager.addBox();
        LeftPupil.setScale({x: 0.05, y: 0.1, z: 0.1});
        LeftPupil.applyMaterial(new THREE.MeshStandardMaterial({color: 0x000000}));
        LeftPupil.entity.position.z = 0.001;
        LeftPupil.entity.position.x = -0.1;
        LeftPupil.entity.position.y = -0.02;
        eyes.attachEntity(LeftPupil);

        LeftEyeColor = entityManager.addBox();
        LeftEyeColor.setScale({x: 0.05, y: 0.05, z: 0.1});
        LeftEyeColor.applyMaterial(new THREE.MeshStandardMaterial({color: color.eyes}));
        LeftEyeColor.entity.position.y = 0.075;
        LeftPupil.attachEntity(LeftEyeColor);

        RightPupil = entityManager.addBox();
        RightPupil.setScale({x: 0.05, y: 0.1, z: 0.1});
        RightPupil.applyMaterial(new THREE.MeshStandardMaterial({color: 0x000000}));
        RightPupil.entity.position.z = 0.001;
        RightPupil.entity.position.x = 0.1;
        RightPupil.entity.position.y = -0.02;
        eyes.attachEntity(RightPupil);

        RightEyeColor = entityManager.addBox();
        RightEyeColor.setScale({x: 0.05, y: 0.05, z: 0.1});
        RightEyeColor.applyMaterial(new THREE.MeshStandardMaterial({color: color.eyes}));
        RightEyeColor.entity.position.y = 0.075;
        RightPupil.attachEntity(RightEyeColor);
    }



    // Sonic Quills
    {


        quills = {
            topCenter: null,
            topRight: null,
            topLeft: null,
            bottomCenter: null,
            bottomRight: null,
            bottomLeft: null
        }

        // Add the bone to each quill for animation purposes
        quills.topCenter = entityManager.addBox();
        quills.topCenter.setScale({x: 0.02, y: 0.02, z: 0.02});
        quills.topCenter.applyMaterial(new THREE.MeshStandardMaterial({color: 0xff0000}));
        quills.topCenter.entity.position.y = 0.14;
        quills.topCenter.entity.position.z = 0.07;

        quills.topCenter.entity.rotation.x = -1.1;

        quills.topCenter.length = 0.65;
        head.attachEntity(quills.topCenter);



        quills.topRight = entityManager.addBox();
        quills.topRight.setScale({x: 0.02, y: 0.02, z: 0.02});
        quills.topRight.applyMaterial(new THREE.MeshStandardMaterial({color: 0xff0000}));
        quills.topRight.entity.position.x = -0.13;
        quills.topRight.entity.position.y = 0.13;

        quills.topRight.entity.rotation.x = -1.4;
        quills.topRight.entity.rotation.z = 0.4;

        quills.topRight.length = 0.5;
        head.attachEntity(quills.topRight);



        quills.topLeft = entityManager.addBox();
        quills.topLeft.setScale({x: 0.02, y: 0.02, z: 0.02});
        quills.topLeft.applyMaterial(new THREE.MeshStandardMaterial({color: 0xff0000}));
        quills.topLeft.entity.position.x = 0.13;
        quills.topLeft.entity.position.y = 0.13;

        quills.topLeft.entity.rotation.x = -1.4;
        quills.topLeft.entity.rotation.z = -0.4;

        quills.topLeft.length = 0.5;
        head.attachEntity(quills.topLeft);



        quills.bottomCenter = entityManager.addBox();
        quills.bottomCenter.setScale({x: 0.02, y: 0.02, z: 0.02});
        quills.bottomCenter.applyMaterial(new THREE.MeshStandardMaterial({color: 0xff0000}));
        quills.bottomCenter.entity.position.y = -0.1;
        quills.bottomCenter.entity.position.z = 0.02;

        quills.bottomCenter.entity.rotation.x = -1.4;

        quills.bottomCenter.length = 0.6;
        head.attachEntity(quills.bottomCenter);



        quills.bottomRight = entityManager.addBox();
        quills.bottomRight.setScale({x: 0.02, y: 0.02, z: 0.02});
        quills.bottomRight.applyMaterial(new THREE.MeshStandardMaterial({color: 0xff0000}));
        quills.bottomRight.entity.position.x = -0.1;
        quills.bottomRight.entity.position.y = -0.05;

        quills.bottomRight.entity.rotation.x = -2;
        quills.bottomRight.entity.rotation.z = 0.4;

        quills.bottomRight.length = 0.6;
        head.attachEntity(quills.bottomRight);



        quills.bottomLeft = entityManager.addBox();
        quills.bottomLeft.setScale({x: 0.02, y: 0.02, z: 0.02});
        quills.bottomLeft.applyMaterial(new THREE.MeshStandardMaterial({color: 0xff0000}));
        quills.bottomLeft.entity.position.x = 0.1;
        quills.bottomLeft.entity.position.y = -0.05;

        quills.bottomLeft.entity.rotation.x = -2;
        quills.bottomLeft.entity.rotation.z = -0.4;

        quills.bottomLeft.length = 0.6;
        head.attachEntity(quills.bottomLeft);
        


        // Add the quill visual to each bone
        for (let quill in quills) {
            const quillVisual = entityManager.addBox();
            quillVisual.setScale({x: 0.25, y: quills[quill].length, z: 0.25});
            quillVisual.applyMaterial(new THREE.MeshStandardMaterial({color: color.quills.normal}));
            quillVisual.entity.position.y = quills[quill].length / 2;
            quills[quill].attachEntity(quillVisual);
        }

    }


    // Ears
    {
        rightEar = entityManager.addBox();
        rightEar.setScale({x: 0.15, y: 0.15, z: 0.05});
        rightEar.applyMaterial(new THREE.MeshStandardMaterial({color: color.skin}));
        rightEar.entity.position.x = -0.2;
        rightEar.entity.position.y = 0.28;
        rightEar.entity.rotation.order = "YXZ";
        rightEar.entity.rotation.x = 0;
        rightEar.entity.rotation.z = 0.2;
        head.attachEntity(rightEar);

        leftEar = entityManager.addBox();
        leftEar.setScale({x: 0.15, y: 0.15, z: 0.05});
        leftEar.applyMaterial(new THREE.MeshStandardMaterial({color: color.skin}));
        leftEar.entity.position.x = 0.2;
        leftEar.entity.position.y = 0.28;
        leftEar.entity.rotation.order = "YXZ";
        leftEar.entity.rotation.x = 0;
        leftEar.entity.rotation.z = -0.2;
        head.attachEntity(leftEar);
    }
    

    // Arms
    {
        leftSholder = entityManager.addBox();
        leftSholder.setScale({x: 0, y: 0, z: 0});
        leftSholder.entity.position.x = -0.25;
        leftSholder.entity.position.y = 0.15;
        leftSholder.entity.rotation.order = "YXZ";
        leftSholder.entity.rotation.x = 0;
        leftSholder.entity.rotation.z = -0.5;
        torso.attachEntity(leftSholder);

        leftArm = entityManager.addBox();
        leftArm.setScale({x: 0.12, y: 0.3, z: 0.12});
        leftArm.applyMaterial(new THREE.MeshStandardMaterial({color: color.skin}));
        leftArm.entity.position.y = -0.1;
        leftSholder.attachEntity(leftArm);

        leftElbow = entityManager.addBox();
        leftElbow.setScale({x: 0, y: 0, z: 0});
        leftElbow.entity.position.y = -0.1;
        leftArm.attachEntity(leftElbow);

        lowerLeftArm = entityManager.addBox();
        lowerLeftArm.setScale({x: 0.12, y: 0.2, z: 0.12});
        lowerLeftArm.applyMaterial(new THREE.MeshStandardMaterial({color: color.skin}));
        lowerLeftArm.entity.position.y = -0.1;
        leftSholder.entity.rotation.order = "YXZ";
        leftSholder.entity.rotation.x = 0;
        leftSholder.entity.rotation.z = -0.5;
        leftElbow.attachEntity(lowerLeftArm);

        leftHand = entityManager.addBox();
        leftHand.setScale({x: 0.15, y: 0.15, z: 0.15});
        leftHand.applyMaterial(new THREE.MeshStandardMaterial({color: 0xffffff}));
        leftHand.entity.position.y = -0.17;
        lowerLeftArm.attachEntity(leftHand);



        rightSholder = entityManager.addBox();
        rightSholder.setScale({x: 0, y: 0, z: 0});
        rightSholder.entity.position.x = 0.25;
        rightSholder.entity.position.y = 0.15;
        rightSholder.entity.rotation.order = "YXZ";
        rightSholder.entity.rotation.x = 0;
        rightSholder.entity.rotation.z = 0.5;
        torso.attachEntity(rightSholder);

        rightArm = entityManager.addBox();
        rightArm.setScale({x: 0.12, y: 0.3, z: 0.12});
        rightArm.applyMaterial(new THREE.MeshStandardMaterial({color: color.skin}));
        rightArm.entity.position.y = -0.1;
        rightSholder.attachEntity(rightArm);

        rightElbow = entityManager.addBox();
        rightElbow.setScale({x: 0, y: 0, z: 0});
        rightElbow.entity.position.y = -0.1;
        rightArm.attachEntity(rightElbow);

        lowerRightArm = entityManager.addBox();
        lowerRightArm.setScale({x: 0.12, y: 0.2, z: 0.12});
        lowerRightArm.applyMaterial(new THREE.MeshStandardMaterial({color: color.skin}));
        lowerRightArm.entity.position.y = -0.1;
        rightSholder.entity.rotation.order = "YXZ";
        rightSholder.entity.rotation.x = 0;
        rightSholder.entity.rotation.z = 0.5;
        rightElbow.attachEntity(lowerRightArm);

        rightHand = entityManager.addBox();
        rightHand.setScale({x: 0.15, y: 0.15, z: 0.15});
        rightHand.applyMaterial(new THREE.MeshStandardMaterial({color: 0xffffff}));
        rightHand.entity.position.y = -0.17;
        lowerRightArm.attachEntity(rightHand);
    }


    // Legs
    {
        leftHip = entityManager.addBox();
        leftHip.setScale({x: 0, y: 0, z: 0});
        leftHip.entity.position.x = -0.12;
        leftHip.entity.position.y = -0.1;
        leftHip.entity.rotation.x = 0;
        torso.attachEntity(leftHip);

        leftLeg = entityManager.addBox();
        leftLeg.setScale({x: 0.12, y: 0.4, z: 0.12});
        leftLeg.applyMaterial(new THREE.MeshStandardMaterial({color: color.quills.normal}));
        leftLeg.entity.position.y = -0.3;
        leftHip.attachEntity(leftLeg);

        leftKnee = entityManager.addBox();
        leftKnee.setScale({x: 0, y: 0, z: 0});
        leftKnee.entity.position.y = -0.2;
        leftKnee.entity.rotation.x = 2;
        leftLeg.attachEntity(leftKnee);

        lowerLeftLeg = entityManager.addBox();
        lowerLeftLeg.setScale({x: 0.12, y: 0.3, z: 0.12});
        lowerLeftLeg.applyMaterial(new THREE.MeshStandardMaterial({color: color.quills.normal}));
        lowerLeftLeg.entity.position.y = -0.15;
        leftKnee.attachEntity(lowerLeftLeg);

        leftAnkle = entityManager.addBox(); // Ankle also works as the sock of the shoe
        leftAnkle.applyMaterial(new THREE.MeshStandardMaterial({color: 0xffffff}));
        leftAnkle.setScale({x: 0.15, y: 0.1, z: 0.15});
        leftAnkle.entity.position.y = -0.1;
        // leftAnkle.entity.rotation.x = 0.2;
        lowerLeftLeg.attachEntity(leftAnkle);

        leftFoot = entityManager.addBox();
        leftFoot.setScale({x: 0.2, y: 0.15, z: 0.4});
        leftFoot.applyMaterial(new THREE.MeshStandardMaterial({color: color.shoes}));
        leftFoot.entity.position.y = -0.08;
        leftFoot.entity.position.z = 0.08;
        leftAnkle.attachEntity(leftFoot);

        if (character === "sonic") {
            // Cosmetics of the shoe (straps and buckle)
            const leftStrap = entityManager.addBox();
            leftStrap.setScale({x: 0.21, y: 0.16, z: 0.1});
            leftStrap.applyMaterial(new THREE.MeshStandardMaterial({color: 0xffffff}));
            leftStrap.entity.position.y = 0.02;
            leftFoot.attachEntity(leftStrap);

            const leftBuckle = entityManager.addBox();
            leftBuckle.setScale({x: 0.05, y: 0.06, z: 0.12});
            leftBuckle.applyMaterial(new THREE.MeshStandardMaterial({color: 0xffd700})); // gold
            leftBuckle.entity.position.y = -0.03;
            leftBuckle.entity.position.x = -0.1;
            leftFoot.attachEntity(leftBuckle);
        }






        rightHip = entityManager.addBox();
        rightHip.setScale({x: 0, y: 0, z: 0});
        rightHip.entity.position.x = 0.12;
        rightHip.entity.position.y = -0.1;
        rightHip.entity.rotation.x = 0;
        torso.attachEntity(rightHip);

        rightLeg = entityManager.addBox();
        rightLeg.setScale({x: 0.12, y: 0.4, z: 0.12});
        rightLeg.applyMaterial(new THREE.MeshStandardMaterial({color: color.quills.normal}));
        rightLeg.entity.position.y = -0.3;
        rightHip.attachEntity(rightLeg);

        rightKnee = entityManager.addBox();
        rightKnee.setScale({x: 0, y: 0, z: 0});
        rightKnee.entity.position.y = -0.2;
        rightKnee.entity.rotation.x = 2;
        rightLeg.attachEntity(rightKnee);

        lowerRightLeg = entityManager.addBox();
        lowerRightLeg.setScale({x: 0.12, y: 0.3, z: 0.12});
        lowerRightLeg.applyMaterial(new THREE.MeshStandardMaterial({color: color.quills.normal}));
        lowerRightLeg.entity.position.y = -0.15;
        rightKnee.attachEntity(lowerRightLeg);

        rightAnkle = entityManager.addBox(); // Ankle also works as the sock of the shoe
        rightAnkle.applyMaterial(new THREE.MeshStandardMaterial({color: 0xffffff}));
        rightAnkle.setScale({x: 0.15, y: 0.1, z: 0.15});
        rightAnkle.entity.position.y = -0.1;
        // rightAnkle.entity.rotation.x = 0.2;
        lowerRightLeg.attachEntity(rightAnkle);

        rightFoot = entityManager.addBox();
        rightFoot.setScale({x: 0.2, y: 0.15, z: 0.4});
        rightFoot.applyMaterial(new THREE.MeshStandardMaterial({color: color.shoes}));
        rightFoot.entity.position.y = -0.08;
        rightFoot.entity.position.z = 0.08;
        rightAnkle.attachEntity(rightFoot);

        if (character === "sonic") {
            // Cosmetics of the shoe (straps and buckle)
            const rightStrap = entityManager.addBox();
            rightStrap.setScale({x: 0.21, y: 0.16, z: 0.1});
            rightStrap.applyMaterial(new THREE.MeshStandardMaterial({color: 0xffffff}));
            rightStrap.entity.position.y = 0.02;
            rightFoot.attachEntity(rightStrap);

            const rightBuckle = entityManager.addBox();
            rightBuckle.setScale({x: 0.05, y: 0.06, z: 0.12});
            rightBuckle.applyMaterial(new THREE.MeshStandardMaterial({color: 0xffd700})); // gold
            rightBuckle.entity.position.y = -0.03;
            rightBuckle.entity.position.x = 0.1;
            rightFoot.attachEntity(rightBuckle);
        }
    }






    player.bones = {
        leftArm: leftArm,
        rightArm: rightArm,
        leftSholder: leftSholder,
        rightSholder: rightSholder,
        leftElbow: leftElbow,
        rightElbow: rightElbow,
        leftHip: leftHip,
        rightHip: rightHip,
        leftKnee: leftKnee,
        rightKnee: rightKnee,
        leftAnkle: leftAnkle,
        rightAnkle: rightAnkle,
        torso: torso,
        quills: quills,
        head: head,
        neck: neck
    }
    
    return player;
}

function createKnucklesPlayer() {
    let color = {
        quills: {normal: 0xff0000, super: 0xff5555},
        skin: 0xffcc99,
        mouth: 0xbb8855,
        shoes: 0xff0000,
        eyes: 0xbb0088,
    };

    let player, torso, neck, head;
    let muzzle, mouth, nose, eyes, brows, LeftPupil, LeftEyeColor, RightPupil, RightEyeColor, rightEar, leftEar, quills;
    let stomach, leftArm, rightArm, leftSholder, rightSholder, leftElbow, rightElbow, leftHand, rightHand, lowerLeftArm, lowerRightArm;
    let leftHip, rightHip, leftLeg, rightLeg, leftKnee, rightKnee, lowerLeftLeg, lowerRightLeg, leftAnkle, rightAnkle, leftFoot, rightFoot;

    // main hit box
    {
        player = entityManager.addBox();
        player._visual.material.transparent = true;
        player._visual.material.opacity = 0;
        player.setScale({x: 0.8, y: 2, z: 0.8});
    }


    // Torso
    {
        torso = entityManager.addBox();
        torso.setScale({x: 0.35, y: 0.45, z: 0.25});
        torso.applyMaterial(new THREE.MeshStandardMaterial({color: color.quills.normal}));
        torso.entity.position.y = 0.3;
        player.attachEntity(torso);

        stomach = entityManager.addBox();
        stomach.setScale({x: 0.25, y: 0.1, z: 0.001});
        stomach.applyMaterial(new THREE.MeshStandardMaterial({color: 0xffffff}));
        stomach.entity.position.y = 0.1;
        stomach.entity.position.z = 0.125;
        torso.attachEntity(stomach);
    }



    // Head Base
    {
        neck = entityManager.addBox();
        neck.setScale({x: 0.1, y: 0.1, z: 0.1});
        neck.applyMaterial(new THREE.MeshStandardMaterial({color: color.quills.normal}));
        neck.entity.position.y = 0.25;
        neck.entity.rotation.order = "YXZ";
        neck.entity.rotation.x = 0;
        neck.entity.rotation.y = 0;
        torso.attachEntity(neck);

        head = entityManager.addBox();
        head.setScale({x: 0.5, y: 0.5, z: 0.4});
        head.applyMaterial(new THREE.MeshStandardMaterial({color: color.quills.normal}));
        head.entity.rotation.order = "YXZ";
        head.entity.position.y = 0.3;
        head.entity.position.z = -0.05;
        neck.attachEntity(head);
    }



    // Knuckles' face details
    {
        muzzle = entityManager.addBox();
        muzzle.setScale({x: 0.52, y: 0.15, z: 0.1});
        muzzle.applyMaterial(new THREE.MeshStandardMaterial({color: color.skin}));
        muzzle.entity.position.z = 0.16;
        muzzle.entity.position.y = -0.18;
        head.attachEntity(muzzle);

        mouth = entityManager.addBox(); // mouth
        mouth.setScale({x: 0.1, y: 0.05, z: 0.1});
        mouth.applyMaterial(new THREE.MeshStandardMaterial({color: color.mouth}));
        mouth.entity.position.z = 0.161;
        mouth.entity.position.y = -0.17;
        // mouth.entity.position.x = 0.1;
        head.attachEntity(mouth);

        nose = entityManager.addBox();
        nose.setScale({x: 0.04, y: 0.04, z: 0.2});
        nose.applyMaterial(new THREE.MeshStandardMaterial({color: 0x000000}));
        nose.entity.position.z = 0.15;
        nose.entity.position.y = -0.12;
        nose.entity.rotation.x = -0.2;
        head.attachEntity(nose);

        eyes = entityManager.addBox();
        eyes.setScale({x: 0.51, y: 0.2, z: 0.1});
        eyes.applyMaterial(new THREE.MeshStandardMaterial({color: 0xffffff}));
        eyes.entity.position.z = 0.151;
        eyes.entity.position.y = -0.01;
        head.attachEntity(eyes);

        brows = entityManager.addBox();
        brows.setScale({x: 0.1, y: 0.3, z: 0.1});
        brows.applyMaterial(new THREE.MeshStandardMaterial({color: color.quills.normal}));
        brows.entity.position.z = 0.154;
        brows.entity.rotation.x = -0.03;
        brows.entity.position.y = 0.04;
        head.attachEntity(brows);
    }


    // Eye details
    {
        LeftPupil = entityManager.addBox();
        LeftPupil.setScale({x: 0.05, y: 0.1, z: 0.1});
        LeftPupil.applyMaterial(new THREE.MeshStandardMaterial({color: 0x000000}));
        LeftPupil.entity.position.z = 0.001;
        LeftPupil.entity.position.x = -0.1;
        LeftPupil.entity.position.y = -0.02;
        eyes.attachEntity(LeftPupil);

        LeftEyeColor = entityManager.addBox();
        LeftEyeColor.setScale({x: 0.05, y: 0.05, z: 0.1});
        LeftEyeColor.applyMaterial(new THREE.MeshStandardMaterial({color: color.eyes}));
        LeftEyeColor.entity.position.y = 0.075;
        LeftPupil.attachEntity(LeftEyeColor);

        RightPupil = entityManager.addBox();
        RightPupil.setScale({x: 0.05, y: 0.1, z: 0.1});
        RightPupil.applyMaterial(new THREE.MeshStandardMaterial({color: 0x000000}));
        RightPupil.entity.position.z = 0.001;
        RightPupil.entity.position.x = 0.1;
        RightPupil.entity.position.y = -0.02;
        eyes.attachEntity(RightPupil);

        RightEyeColor = entityManager.addBox();
        RightEyeColor.setScale({x: 0.05, y: 0.05, z: 0.1});
        RightEyeColor.applyMaterial(new THREE.MeshStandardMaterial({color: color.eyes}));
        RightEyeColor.entity.position.y = 0.075;
        RightPupil.attachEntity(RightEyeColor);
    }



    // Knuckles Dreadlocks (technically quills)
    {


        quills = {
            topLeft: null,
            bottomLeft: null,
            topRight: null,
            bottomRight: null
        }

        // Add the bone to each quill for animation purposes
        quills.topLeft = entityManager.addBox();
        quills.topLeft.setScale({x: 0.02, y: 0.02, z: 0.02});
        quills.topLeft.applyMaterial(new THREE.MeshStandardMaterial({color: 0xff0000}));
        quills.topLeft.width = 0.38;
        quills.topLeft.length = 0.5;
        quills.topLeft.entity.position.x = 0.2;
        quills.topLeft.entity.position.y = 0.23;
        quills.topLeft.entity.rotation.z = -2.9;
        head.attachEntity(quills.topLeft);

        quills.bottomLeft = entityManager.addBox();
        quills.bottomLeft.setScale({x: 0.02, y: 0.02, z: 0.02});
        quills.bottomLeft.applyMaterial(new THREE.MeshStandardMaterial({color: 0xff0000}));
        quills.bottomLeft.width = 0.2;
        quills.bottomLeft.length = 0.5;
        quills.bottomLeft.entity.position.x = 0.22;
        quills.bottomLeft.entity.position.y = 0.2;
        quills.bottomLeft.entity.rotation.z = -2.8;
        head.attachEntity(quills.bottomLeft);

        quills.topRight = entityManager.addBox();
        quills.topRight.setScale({x: 0.02, y: 0.02, z: 0.02});
        quills.topRight.applyMaterial(new THREE.MeshStandardMaterial({color: 0xff0000}));
        quills.topRight.width = 0.38;
        quills.topRight.length = 0.5;
        quills.topRight.entity.position.x = -0.2;
        quills.topRight.entity.position.y = 0.23;
        quills.topRight.entity.rotation.z = 2.9;
        head.attachEntity(quills.topRight);

        quills.bottomRight = entityManager.addBox();
        quills.bottomRight.setScale({x: 0.02, y: 0.02, z: 0.02});
        quills.bottomRight.applyMaterial(new THREE.MeshStandardMaterial({color: 0xff0000}));
        quills.bottomRight.width = 0.2;
        quills.bottomRight.length = 0.5;
        quills.bottomRight.entity.position.x = -0.22;
        quills.bottomRight.entity.position.y = 0.2;
        quills.bottomRight.entity.rotation.z = 2.8;
        head.attachEntity(quills.bottomRight);
        


        // Add the quill visual to each bone
        for (let quill in quills) {
            const quillVisual = entityManager.addBox();
            quillVisual.setScale({x: 0.1, y: quills[quill].length, z: quills[quill].width});
            quillVisual.applyMaterial(new THREE.MeshStandardMaterial({color: color.quills.normal}));
            quillVisual.entity.position.y = quills[quill].length / 2;
            quills[quill].attachEntity(quillVisual);
        }

    }
    

    // Arms
    {
        leftSholder = entityManager.addBox();
        leftSholder.setScale({x: 0, y: 0, z: 0});
        leftSholder.entity.position.x = -0.25;
        leftSholder.entity.position.y = 0.15;
        leftSholder.entity.rotation.order = "YXZ";
        leftSholder.entity.rotation.x = 0;
        leftSholder.entity.rotation.z = -0.5;
        torso.attachEntity(leftSholder);

        leftArm = entityManager.addBox();
        leftArm.setScale({x: 0.12, y: 0.3, z: 0.12});
        leftArm.applyMaterial(new THREE.MeshStandardMaterial({color: color.skin}));
        leftArm.entity.position.y = -0.1;
        leftSholder.attachEntity(leftArm);

        leftElbow = entityManager.addBox();
        leftElbow.setScale({x: 0, y: 0, z: 0});
        leftElbow.entity.position.y = -0.1;
        leftArm.attachEntity(leftElbow);

        lowerLeftArm = entityManager.addBox();
        lowerLeftArm.setScale({x: 0.12, y: 0.2, z: 0.12});
        lowerLeftArm.applyMaterial(new THREE.MeshStandardMaterial({color: color.skin}));
        lowerLeftArm.entity.position.y = -0.1;
        leftSholder.entity.rotation.order = "YXZ";
        leftSholder.entity.rotation.x = 0;
        leftSholder.entity.rotation.z = -0.5;
        leftElbow.attachEntity(lowerLeftArm);

        leftHand = entityManager.addBox();
        leftHand.setScale({x: 0.25, y: 0.25, z: 0.25});
        leftHand.applyMaterial(new THREE.MeshStandardMaterial({color: 0xffffff}));
        leftHand.entity.position.y = -0.17;
        lowerLeftArm.attachEntity(leftHand);



        rightSholder = entityManager.addBox();
        rightSholder.setScale({x: 0, y: 0, z: 0});
        rightSholder.entity.position.x = 0.25;
        rightSholder.entity.position.y = 0.15;
        rightSholder.entity.rotation.order = "YXZ";
        rightSholder.entity.rotation.x = 0;
        rightSholder.entity.rotation.z = 0.5;
        torso.attachEntity(rightSholder);

        rightArm = entityManager.addBox();
        rightArm.setScale({x: 0.12, y: 0.3, z: 0.12});
        rightArm.applyMaterial(new THREE.MeshStandardMaterial({color: color.skin}));
        rightArm.entity.position.y = -0.1;
        rightSholder.attachEntity(rightArm);

        rightElbow = entityManager.addBox();
        rightElbow.setScale({x: 0, y: 0, z: 0});
        rightElbow.entity.position.y = -0.1;
        rightArm.attachEntity(rightElbow);

        lowerRightArm = entityManager.addBox();
        lowerRightArm.setScale({x: 0.12, y: 0.2, z: 0.12});
        lowerRightArm.applyMaterial(new THREE.MeshStandardMaterial({color: color.skin}));
        lowerRightArm.entity.position.y = -0.1;
        rightSholder.entity.rotation.order = "YXZ";
        rightSholder.entity.rotation.x = 0;
        rightSholder.entity.rotation.z = 0.5;
        rightElbow.attachEntity(lowerRightArm);

        rightHand = entityManager.addBox();
        rightHand.setScale({x: 0.25, y: 0.25, z: 0.25});
        rightHand.applyMaterial(new THREE.MeshStandardMaterial({color: 0xffffff}));
        rightHand.entity.position.y = -0.17;
        lowerRightArm.attachEntity(rightHand);
    }


    // Legs
    {
        leftHip = entityManager.addBox();
        leftHip.setScale({x: 0, y: 0, z: 0});
        leftHip.entity.position.x = -0.12;
        leftHip.entity.position.y = -0.1;
        leftHip.entity.rotation.x = 0;
        torso.attachEntity(leftHip);

        leftLeg = entityManager.addBox();
        leftLeg.setScale({x: 0.12, y: 0.4, z: 0.12});
        leftLeg.applyMaterial(new THREE.MeshStandardMaterial({color: color.quills.normal}));
        leftLeg.entity.position.y = -0.3;
        leftHip.attachEntity(leftLeg);

        leftKnee = entityManager.addBox();
        leftKnee.setScale({x: 0, y: 0, z: 0});
        leftKnee.entity.position.y = -0.2;
        leftKnee.entity.rotation.x = 2;
        leftLeg.attachEntity(leftKnee);

        lowerLeftLeg = entityManager.addBox();
        lowerLeftLeg.setScale({x: 0.12, y: 0.3, z: 0.12});
        lowerLeftLeg.applyMaterial(new THREE.MeshStandardMaterial({color: color.quills.normal}));
        lowerLeftLeg.entity.position.y = -0.15;
        leftKnee.attachEntity(lowerLeftLeg);

        leftAnkle = entityManager.addBox(); // Ankle also works as the sock of the shoe
        leftAnkle.applyMaterial(new THREE.MeshStandardMaterial({color: 0x22ff22}));
        leftAnkle.setScale({x: 0.15, y: 0.1, z: 0.15});
        leftAnkle.entity.position.y = -0.1;
        // leftAnkle.entity.rotation.x = 0.2;
        lowerLeftLeg.attachEntity(leftAnkle);

        leftFoot = entityManager.addBox();
        leftFoot.setScale({x: 0.2, y: 0.15, z: 0.4});
        leftFoot.applyMaterial(new THREE.MeshStandardMaterial({color: color.shoes}));
        leftFoot.entity.position.y = -0.08;
        leftFoot.entity.position.z = 0.08;
        leftAnkle.attachEntity(leftFoot);

        // Cosmetics of the shoe (straps and buckle)
        const leftStrap = entityManager.addBox();
        leftStrap.setScale({x: 0.21, y: 0.16, z: 0.1});
        leftStrap.applyMaterial(new THREE.MeshStandardMaterial({color: 0xffff00})); // yellow
        leftStrap.entity.position.y = 0.02;
        leftFoot.attachEntity(leftStrap);

        const leftBuckle = entityManager.addBox();
        leftBuckle.setScale({x: 0.1, y: 0.06, z: 0.15});
        leftBuckle.applyMaterial(new THREE.MeshStandardMaterial({color: 0x333333}));
        leftBuckle.entity.position.y = 0.08;
        leftBuckle.entity.position.z = 0.08;
        leftFoot.attachEntity(leftBuckle);






        rightHip = entityManager.addBox();
        rightHip.setScale({x: 0, y: 0, z: 0});
        rightHip.entity.position.x = 0.12;
        rightHip.entity.position.y = -0.1;
        rightHip.entity.rotation.x = 0;
        torso.attachEntity(rightHip);

        rightLeg = entityManager.addBox();
        rightLeg.setScale({x: 0.12, y: 0.4, z: 0.12});
        rightLeg.applyMaterial(new THREE.MeshStandardMaterial({color: color.quills.normal}));
        rightLeg.entity.position.y = -0.3;
        rightHip.attachEntity(rightLeg);

        rightKnee = entityManager.addBox();
        rightKnee.setScale({x: 0, y: 0, z: 0});
        rightKnee.entity.position.y = -0.2;
        rightKnee.entity.rotation.x = 2;
        rightLeg.attachEntity(rightKnee);

        lowerRightLeg = entityManager.addBox();
        lowerRightLeg.setScale({x: 0.12, y: 0.3, z: 0.12});
        lowerRightLeg.applyMaterial(new THREE.MeshStandardMaterial({color: color.quills.normal}));
        lowerRightLeg.entity.position.y = -0.15;
        rightKnee.attachEntity(lowerRightLeg);

        rightAnkle = entityManager.addBox(); // Ankle also works as the sock of the shoe
        rightAnkle.applyMaterial(new THREE.MeshStandardMaterial({color: 0x22ff22}));
        rightAnkle.setScale({x: 0.15, y: 0.1, z: 0.15});
        rightAnkle.entity.position.y = -0.1;
        // rightAnkle.entity.rotation.x = 0.2;
        lowerRightLeg.attachEntity(rightAnkle);

        rightFoot = entityManager.addBox();
        rightFoot.setScale({x: 0.2, y: 0.15, z: 0.4});
        rightFoot.applyMaterial(new THREE.MeshStandardMaterial({color: color.shoes}));
        rightFoot.entity.position.y = -0.08;
        rightFoot.entity.position.z = 0.08;
        rightAnkle.attachEntity(rightFoot);

        // Cosmetics of the shoe (straps and buckle)
        const rightStrap = entityManager.addBox();
        rightStrap.setScale({x: 0.21, y: 0.16, z: 0.1});
        rightStrap.applyMaterial(new THREE.MeshStandardMaterial({color: 0xffff00}));
        rightStrap.entity.position.y = 0.02;
        rightFoot.attachEntity(rightStrap);

        const rightBuckle = entityManager.addBox();
        rightBuckle.setScale({x: 0.1, y: 0.06, z: 0.15});
        rightBuckle.applyMaterial(new THREE.MeshStandardMaterial({color: 0x333333}));
        rightBuckle.entity.position.y = 0.08;
        rightBuckle.entity.position.z = 0.08;
        rightFoot.attachEntity(rightBuckle);
    }






    player.bones = {
        leftArm: leftArm,
        rightArm: rightArm,
        leftSholder: leftSholder,
        rightSholder: rightSholder,
        leftElbow: leftElbow,
        rightElbow: rightElbow,
        leftHip: leftHip,
        rightHip: rightHip,
        leftKnee: leftKnee,
        rightKnee: rightKnee,
        leftAnkle: leftAnkle,
        rightAnkle: rightAnkle,
        torso: torso,
        quills: quills,
        head: head,
        neck: neck
    }
    
    return player;
}

const sonic = createSonicPlayer("sonic");
sonic.velocity.z = 5; 
sonic.entity.position.y = 1;
sonic.entity.position.x = -1;

const box = entityManager.addBox();
box.setScale({x: 0, y: 0, z: 0});
box.applyMaterial(new THREE.MeshStandardMaterial({color: 0xff0000}));
box.entity.position.y = 1;
box.velocity.z = 5;

const knuckles = createKnucklesPlayer();
knuckles.velocity.z = 5;
knuckles.entity.position.y = 1;
knuckles.entity.position.x = 1;

const camera = new Camera(null, box.entity);
cobble.addPlugin(camera);
camera.mode = "Orbit";
camera.offset.x = 3;
camera.offset.y = 1.5;
camera.orbitAngle = 1.2;

let walkTime = 0;

setInterval(() => {
    camera.orbitAngle -= 0.0025;  // increment each frame in your game loop

    

    // inside your update or wherever you tick the player:
    walkTime += 0.1;

    const swing = Math.sin(walkTime * 1.5) * 0.5; // 6 = speed, 0.6 rad ≈ 34°
    const swing2 = Math.sin((walkTime - 1) * 1.5) * 0.5; // offset swing for knees to add more realism to the walk cycle

    {
        sonic.bones.leftSholder.entity.rotation.x  =  swing;
        sonic.bones.rightSholder.entity.rotation.x = -swing;
        sonic.bones.leftElbow.entity.rotation.x     =  swing - 1;
        sonic.bones.rightElbow.entity.rotation.x    =  -swing - 1;


        sonic.bones.leftHip.entity.rotation.x    = -swing;
        sonic.bones.leftKnee.entity.rotation.x   = (-swing2 * 1.2) + 0.8;
        sonic.bones.leftAnkle.entity.rotation.x  = -swing;

        sonic.bones.rightHip.entity.rotation.x   =  swing;
        sonic.bones.rightKnee.entity.rotation.x  = (swing2 * 1.2) + 0.8;
        sonic.bones.rightAnkle.entity.rotation.x =  swing;
    }

    {
        knuckles.bones.leftSholder.entity.rotation.x  =  swing;
        knuckles.bones.rightSholder.entity.rotation.x = -swing;
        knuckles.bones.leftElbow.entity.rotation.x     =  swing - 1;
        knuckles.bones.rightElbow.entity.rotation.x    =  -swing - 1;


        knuckles.bones.leftHip.entity.rotation.x    = -swing;
        knuckles.bones.leftKnee.entity.rotation.x   = (-swing2 * 1.2) + 0.8;
        knuckles.bones.leftAnkle.entity.rotation.x  = -swing;

        knuckles.bones.rightHip.entity.rotation.x   =  swing;
        knuckles.bones.rightKnee.entity.rotation.x  = (swing2 * 1.2) + 0.8;
        knuckles.bones.rightAnkle.entity.rotation.x =  swing;
    }
    
}, 10);


console.log(cobble);