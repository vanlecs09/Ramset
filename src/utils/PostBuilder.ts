import * as BABYLON from '@babylonjs/core';

export interface PostGroup {
    mesh?: BABYLON.Mesh;
    material?: BABYLON.StandardMaterial;
}

// Global post material - shared across all post instances
let postMaterial: BABYLON.StandardMaterial | null = null;

const initializePostMaterial = (scene: BABYLON.Scene) => {
    if (!postMaterial) {
        postMaterial = new BABYLON.StandardMaterial('postMaterial', scene);
        postMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.1, 0.1); // reddish
        postMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    }
    return postMaterial;
};

export const createPost = (
    scene: BABYLON.Scene,
    height: number = 1,
    diameter: number = 0.2,
    position?: BABYLON.Vector3,
    parent?: BABYLON.TransformNode,
    name: string = 'post'
): PostGroup => {
    const material = initializePostMaterial(scene);

    const post = BABYLON.MeshBuilder.CreateCylinder(
        name,
        { height: height, diameter: diameter },
        scene
    );

    if (position) {
        post.position = position;
    }

    post.material = material;
    post.receiveShadows = true;

    if (parent) {
        post.parent = parent;
    }

    return {
        mesh: post,
        material: material,
    };
};

export const updatePost = (
    postGroup: PostGroup,
    scene: BABYLON.Scene,
    height: number = 1,
    diameter: number = 0.2,
    position?: BABYLON.Vector3,
    parent?: BABYLON.TransformNode,
    name: string = 'post'
) => {
    if (postGroup.mesh) {
        postGroup.mesh.dispose();
    }

    const material = initializePostMaterial(scene);

    const post = BABYLON.MeshBuilder.CreateCylinder(
        name,
        { height: height, diameter: diameter },
        scene
    );

    if (position) {
        post.position = position;
    }

    post.material = material;
    post.receiveShadows = true;

    if (parent) {
        post.parent = parent;
    }

    postGroup.mesh = post;
    postGroup.material = material;
};

export const getPostMaterial = (): BABYLON.StandardMaterial | null => {
    return postMaterial;
};

export const createPostBatch = (
    scene: BABYLON.Scene,
    posts: Array<{ height: number; diameter: number; position?: BABYLON.Vector3; name: string }>,
    parent?: BABYLON.TransformNode
): PostGroup[] => {
    return posts.map(post => 
        createPost(scene, post.height, post.diameter, post.position, parent, post.name)
    );
};
