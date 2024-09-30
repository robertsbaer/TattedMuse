// src/queries.js
import { gql } from "@apollo/client";

export const GET_TATTOO_ARTISTS = gql`
  query GetTattooArtists {
    tattoo_artists {
      id
      name
      location
      instagram
      twitter
      facebook
      imageurl
      styles {
        style
      }
      work_images {
        imageurl
      }
    }
  }
`;

export const GET_ARTISTS = gql`
  query GetArtists {
    tattoo_artists {
      id
      name
      location
      address
      imageurl
      styles {
        style
      }
      work_images {
        imageurl
      }
    }
  }
`;

export const GET_FILTERED_ARTISTS = gql`
  query GetFilteredArtists($searchTerm: String!, $limit: Int, $offset: Int) {
    tattoo_artists(
      where: {
        _or: [
          { name: { _ilike: $searchTerm } }
          { location: { _ilike: $searchTerm } }
          { address: { _ilike: $searchTerm } }
          { styles: { style: { _ilike: $searchTerm } } }
        ]
      }
      limit: $limit
      offset: $offset
    ) {
      id
      name
      location
      address
      imageurl
      styles {
        style
      }
      work_images {
        imageurl
      }
    }
  }
`;

export const GET_ARTIST_BY_ID = gql`
  query GetArtist($id: uuid!) {
    tattoo_artists_by_pk(id: $id) {
      name
      location
      address
      imageurl
      instagram
      twitter
      facebook
      work_images {
        imageurl
      }
      styles {
        style
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
      styles {
        id
        style
      }
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

export const GET_ALL_TATTOO_STYLES = gql`
  query GetAllTattooStyles {
    styles {
      id
      style
    }
  }
`;

export const ADD_NEW_TATTOO_STYLE = gql`
  mutation AddNewTattooStyle($style: String!, $tattoo_artist_id: uuid!) {
    insert_styles_one(
      object: { style: $style, tattoo_artist_id: $tattoo_artist_id }
    ) {
      id
      style
      tattoo_artist_id
    }
  }
`;

export const VALIDATE_INVITE_CODE = gql`
  query ValidateInviteCode($code: String!) {
    invite_codes(where: { code: { _eq: $code }, used: { _eq: false } }) {
      id
      code
      used
      expiration_date
    }
  }
`;

export const MARK_INVITE_CODE_USED = gql`
  mutation MarkInviteCodeUsed($code: String!) {
    update_invite_codes(where: { code: { _eq: $code } }, _set: { used: true }) {
      returning {
        id
        code
        used
      }
    }
  }
`;

export const CREATE_INVITE_CODE = gql`
  mutation CreateInviteCode($creator_id: uuid!, $code: String!) {
    insert_invite_codes_one(object: { creator_id: $creator_id, code: $code }) {
      id
      code
      used
      expiration_date
    }
  }
`;
