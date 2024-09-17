// src/queries.js
import { gql } from "@apollo/client";

export const GET_TATTOO_ARTISTS = gql`
  query GetTattooArtists {
    tattoo_artists {
      id
      name
      address
      facebook
      instagram
      twitter
      location
      imageurl
      styles {
        id
        style
      }
      work_images {
        id
        imageurl
      }
    }
  }
`;

export const GET_TATTOO_ARTIST_BY_USER_ID = gql`
  query GetTattooArtistByUserId($user_id: uuid!) {
    tattoo_artists(where: { user_id: { _eq: $user_id } }) {
      id
      name
      address
      facebook
      instagram
      twitter
      location
      imageurl
    }
  }
`;

export const UPDATE_TATTOO_ARTIST = gql`
  mutation UpdateTattooArtist(
    $id: uuid!
    $name: String
    $address: String
    $facebook: String
    $instagram: String
    $twitter: String
    $location: String
    $imageurl: String
  ) {
    update_tattoo_artists_by_pk(
      pk_columns: { id: $id }
      _set: {
        name: $name
        address: $address
        facebook: $facebook
        instagram: $instagram
        twitter: $twitter
        location: $location
        imageurl: $imageurl
      }
    ) {
      id
      name
    }
  }
`;

// src/queries.js
export const ADD_WORK_IMAGE = gql`
  mutation AddWorkImage($imageurl: String!, $tattoo_artist_id: uuid!) {
    insert_work_images_one(
      object: { imageurl: $imageurl, tattoo_artist_id: $tattoo_artist_id }
    ) {
      id
      imageurl
    }
  }
`;

export const CREATE_TATTOO_ARTIST = gql`
  mutation CreateTattooArtist(
    $user_id: uuid!
    $name: String!
    $address: String
    $facebook: String
    $instagram: String
    $twitter: String
    $location: String
    $imageurl: String
  ) {
    insert_tattoo_artists_one(
      object: {
        user_id: $user_id
        name: $name
        address: $address
        facebook: $facebook
        instagram: $instagram
        twitter: $twitter
        location: $location
        imageurl: $imageurl
      }
    ) {
      id
      name
    }
  }
`;
