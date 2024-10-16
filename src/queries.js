// src/queries.js
import { gql } from "@apollo/client";

export const GET_FILTERED_ARTISTS = gql`
  query GetFilteredArtists($searchTerm: String!, $limit: Int, $offset: Int) {
    tattoo_artists_aggregate(
      where: {
        _or: [
          { name: { _ilike: $searchTerm } }
          { location: { _ilike: $searchTerm } }
          { address: { _ilike: $searchTerm } }
          { styles: { style: { _ilike: $searchTerm } } }
        ]
      }
    ) {
      aggregate {
        count
      }
    }
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
      shop_name
      imageurl
      instagram
      twitter
      facebook
      work_images(limit: 5) {
        imageurl
      }
      styles {
        style
      }
    }
  }
`;

export const GET_ARTIST_BY_ID = gql`
  query GetArtist($id: uuid!) {
    tattoo_artists_by_pk(id: $id) {
      name
      location
      shop_name
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
      shop_name
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
    $shop_name: String
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
        shop_name: $shop_name
        imageurl: $imageurl
      }
    ) {
      id
      name
    }
  }
`;

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
    $shop_name: String
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
        shop_name: $shop_name
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

export const GET_ARTIST_INTERACTIONS = gql`
  query GetArtistInteractions($artist_id: uuid!) {
    artist_interaction_counts_by_pk(artist_id: $artist_id) {
      portfolio_views
      address_clicks
    }
  }
`;

export const GET_ARTIST_SAVES_COUNT = gql`
  query GetArtistSavesCount($artist_id: uuid!) {
    user_favorite_artists_aggregate(
      where: {
        tattoo_artist: { id: { _eq: $artist_id } }
        liked: { _eq: true }
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

export const INCREMENT_PORTFOLIO_VIEW = gql`
  mutation IncrementPortfolioView($artist_id: uuid!) {
    update_artist_interaction_counts(
      where: { artist_id: { _eq: $artist_id } }
      _inc: { portfolio_views: 1 }
    ) {
      affected_rows
    }
  }
`;

export const INCREMENT_ADDRESS_CLICKS = gql`
  mutation IncrementAddressClicks($artist_id: uuid!) {
    update_artist_interaction_counts(
      where: { artist_id: { _eq: $artist_id } }
      _inc: { address_clicks: 1 }
    ) {
      affected_rows
    }
  }
`;

export const INITIALIZE_INTERACTION_COUNTS = gql`
  mutation InitializeInteractionCounts($artist_id: uuid!) {
    insert_artist_interaction_counts_one(
      object: { artist_id: $artist_id, portfolio_views: 0, address_clicks: 0 }
      on_conflict: {
        constraint: artist_interaction_counts_pkey
        update_columns: []
      }
    ) {
      artist_id
    }
  }
`;

// src/queries.js

export const GET_ALL_DATA = gql`
  query GetAll {
    tattoo_artists {
      id
      user_id
      name
      location
      address
      shop_name
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
    invite_codes {
      id
      code
      used
    }
  }
`;

// Mutation to delete a tattoo artist
export const DELETE_TATTOO_ARTIST = gql`
  mutation DeleteTattooArtist($id: uuid!) {
    delete_tattoo_artists_by_pk(id: $id) {
      id
    }
  }
`;

// Mutation to delete an invite
export const DELETE_INVITE = gql`
  mutation DeleteInvite($id: uuid!) {
    delete_invite_codes_by_pk(id: $id) {
      id
    }
  }
`;

export const DELETE_TATTOO_ARTIST_INTERACTIONS = gql`
  mutation DeleteArtistInteractions($artist_id: uuid!) {
    delete_artist_interaction_counts(
      where: { artist_id: { _eq: $artist_id } }
    ) {
      affected_rows
    }
  }
`;

// Mutation to delete a work image by its image URL
export const DELETE_WORK_IMAGE = gql`
  mutation DeleteWorkImage($imageurl: String!) {
    delete_work_images(where: { imageurl: { _eq: $imageurl } }) {
      returning {
        id
      }
    }
  }
`;

export const ADD_FAVORITE_ARTIST = gql`
  mutation AddFavoriteArtist($user_id: uuid!, $artist_id: uuid!) {
    insert_user_favorite_artists_one(
      object: { user_id: $user_id, artist_id: $artist_id, liked: true }
    ) {
      __typename
      id
      tattoo_artist {
        id
        __typename
        name
        imageurl
        location
        address
        shop_name
        instagram
        twitter
        facebook
        styles {
          __typename
          style
        }
        work_images {
          __typename
          imageurl
        }
      }
    }
  }
`;

export const UNLIKE_ARTIST = gql`
  mutation UnlikeArtist($user_id: uuid!, $artist_id: uuid!) {
    delete_user_favorite_artists(
      where: { user_id: { _eq: $user_id }, artist_id: { _eq: $artist_id } }
    ) {
      returning {
        __typename
        id
        artist_id
        tattoo_artist {
          __typename
          id
          name
          imageurl
          location
          address
          shop_name
          instagram
          twitter
          facebook
          styles {
            __typename
            style
          }
          work_images {
            __typename
            imageurl
          }
        }
      }
    }
  }
`;

export const GET_USER_FAVORITE_ARTISTS = gql`
  query GetUserFavoriteArtists($user_id: uuid!) {
    user_favorite_artists(
      where: { user_id: { _eq: $user_id }, liked: { _eq: true } }
    ) {
      __typename
      id
      tattoo_artist {
        id
        __typename
        name
        imageurl
        location
        address
        shop_name
        instagram
        twitter
        facebook
        styles {
          __typename
          style
        }
        work_images {
          __typename
          imageurl
        }
      }
    }
  }
`;

export const SUBSCRIBE_USER_FAVORITE_ARTISTS = gql`
  subscription SubscribeUserFavoriteArtists($user_id: uuid!) {
    user_favorite_artists(
      where: { user_id: { _eq: $user_id }, liked: { _eq: true } }
    ) {
      id
      tattoo_artist {
        id
        name
        imageurl
        location
        address
        shop_name
        instagram
        twitter
        facebook
        styles {
          style
        }
        work_images {
          imageurl
        }
      }
    }
  }
`;

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    users {
      id
      email
    }
  }
`;

export const GET_WORK_IMAGES_BY_ARTIST_ID = gql`
  query GetWorkImagesByArtistId($artistId: uuid!) {
    work_images(where: { tattoo_artist_id: { _eq: $artistId } }) {
      id
      imageurl
    }
  }
`;

export const ADD_AD = gql`
  mutation AddAd(
    $title: String!
    $text: String!
    $imageUrl: String!
    $externalUrl: String!
    $displayFrequency: Int!
    $expirationDate: timestamp!
    $created_at: timestamp!
    $updated_at: timestamp!
  ) {
    insert_ads_one(
      object: {
        title: $title
        text: $text
        image_url: $imageUrl
        external_url: $externalUrl
        display_frequency: $displayFrequency
        expiration_date: $expirationDate
        created_at: $created_at
        updated_at: $updated_at
      }
    ) {
      id
      title
    }
  }
`;

export const GET_ADS = gql`
  query GetAds {
    ads(order_by: { created_at: desc }) {
      id
      title
      text
      image_url
      external_url
      display_frequency
      expiration_date
    }
  }
`;

export const GET_EXPIRED_ADS = gql`
  query GetExpiredAds {
    ads(where: { expiration_date: { _lt: "now()" } }) {
      id
      title
      expiration_date
    }
  }
`;

export const DELETE_AD = gql`
  mutation DeleteAd($id: uuid!) {
    delete_ads_by_pk(id: $id) {
      id
    }
  }
`;
