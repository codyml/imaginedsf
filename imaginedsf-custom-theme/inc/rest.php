<?php
/**
 * Describes and extends the REST API for the site.
 *
 * @package Imagined San Francisco Custom Theme
 */

/**
 * Retrieves content for a content area.
 */
function isf_get_content_area_content() {

	$content_areas = array(
		INTRODUCTION_CONTENT_AREA,
		PROPOSAL_MAPS_INTRO_CONTENT_AREA,
		BIBLIOGRAPHY_CONTENT_AREA,
		CREDITS_CONTENT_AREA,
		FEEDBACK_CONTENT_AREA,
	);

	$content_area_content = array();
	foreach ( $content_areas as $content_area ) {
		$content_area_content[ $content_area ] = get_field( $content_area, CONTENT_AREAS_OPTIONS );
	}

	return $content_area_content;

}


/**
 * Retrieves all published posts of a post type, with ACF fields.
 *
 * @param string $post_type The post type constant.
 */
function isf_get_all_published_posts( $post_type ) {

	$args = array(
		'post_type'      => $post_type,
		'posts_per_page' => -1,
	);

	$query             = new WP_Query( $args );
	$posts             = $query->get_posts();
	$posts_with_fields = array_map(
		function( $post ) {
			$post_array   = $post->to_array();
			$fields_array = get_fields( $post->ID );
			if ( ! empty( $fields_array ) ) {
				return array_merge( $post_array, $fields_array );
			}

			return $post_array;
		},
		$posts
	);

	return $posts_with_fields;

}


/**
 * Retrieves all CMS content for the front-end application.
 */
function isf_get_all_content() {
	return array(
		'content_area_content' => isf_get_content_area_content(),
		'maps'                 => isf_get_all_published_posts( MAP_POST_TYPE ),
		'map_groups'           => isf_get_all_published_posts( MAP_GROUP_POST_TYPE ),
		'narratives'           => isf_get_all_published_posts( NARRATIVE_POST_TYPE ),
		'proposal_eras'        => get_field( 'proposal_eras', PROPOSAL_ERAS_OPTIONS ),
		'basemaps'             => get_field( 'basemaps', BASEMAPS_OPTIONS ),
	);
}


/**
 * Adds endpoint to retrieve all CMS content.
 */
add_action(
	'rest_api_init',
	function() {
		register_rest_route(
			REST_API_NAMESPACE,
			'/content',
			array(
				'methods'  => 'GET',
				'callback' => 'isf_get_all_content',
			)
		);
	}
);


/**
 * Parses body and saves it as a new Feedback post.
 *
 * @param WP_REST_Request $request The POST request.
 */
function isf_handle_feedback_submission( $request ) {
	$message = $request->get_json_params()['message'];
	isf_save_feedback( $message );
}


/**
 * Adds endpoint to accept feedback.
 */
add_action(
	'rest_api_init',
	function() {
		register_rest_route(
			REST_API_NAMESPACE,
			'/feedback',
			array(
				'methods'  => 'POST',
				'callback' => 'isf_handle_feedback_submission',
			)
		);
	}
);


/**
 * Retrieves GeoJSON vector layer data for a Map.
 *
 * @param WP_REST_Request $request The REST request object.
 */
function get_map_layer_json( $request ) {

	$layer_id = $request['layerId'];

	// Check for correct layer type.
	$layer_type = get_field( 'source_type', $layer_id );
	if ( 'wfs_geojson' !== $layer_type ) {

		return array(
			'error'    => 'Layer of type WFS/GeoJSON not found for id',
			'layer_id' => $layer_id,
		);

	}

	// Compose WFS request URL.
	$wfs_base_url     = get_field( 'wfs_base_url', $layer_id );
	$wfs_typenames    = get_field( 'wfs_typenames', $layer_id );
	$wfs_query_string = '?service=wfs&version=2.0.0&request=GetFeature&outputFormat=application/json&typeNames=' . $wfs_typenames;
	$url              = $wfs_base_url . $wfs_query_string;

	// Request WFS payload.
	$response = wp_remote_get( $url );
	if ( $response ) {

		return json_decode( $response['body'] );

	} else {

		return array(
			'error'    => 'Request failed!',
			'layer_id' => $layer_id,
			'url'      => $url,
		);

	}

}


/**
 * Adds endpoint for retrieving GeoJSON.
 */
add_action(
	'rest_api_init',
	function() {
		register_rest_route(
			REST_API_NAMESPACE,
			'/geojson',
			array(
				'methods'  => 'GET',
				'callback' => 'get_map_layer_json',
			)
		);
	}
);


/**
 * Given an address, performs a forward-geocoding request to the
 * MapQuest API to get full address matches and their respective
 * lat/lng coordinates.  Attempts to find only results in San Francisco
 * and returns the coordinates and normalized address of the first
 * result.
 *
 * @param WP_REST_Request $request The WP REST request object.
 */
function isf_geocode( WP_REST_Request $request ) {

	$input_address  = $request['address'];
	$input_address .= ', San Francisco, CA USA';

	// Performs request.
	$url                  = 'http://www.mapquestapi.com/geocoding/v1/address';
	$url                 .= '?key=' . MAPQUEST_API_KEY;
	$url                 .= '&location=' . rawurlencode( $input_address );
	$url                 .= '&maxResults=1';
	$response             = wp_remote_get( $url );
	$response_body        = wp_remote_retrieve_body( $response );
	$parsed_response_body = json_decode( $response_body, true );
	$locations            = $parsed_response_body['results'][0]['locations'];

	if ( count( $locations ) > 0 ) {
		return array(
			'address'     => $locations[0]['street'],
			'coordinates' => array(
				$locations[0]['displayLatLng']['lat'],
				$locations[0]['displayLatLng']['lng'],
			),
		);
	} else {
		return array(
			'error'   => 'No matching locations found',
			'address' => $input_address,
		);
	}
}


/*
*	Adds endpoints for forward-geocoding addresses to coordinates
*	with the MapQuest API.
*/

add_action(
	'rest_api_init',
	function() {
		register_rest_route(
			REST_API_NAMESPACE,
			'/geocode',
			array(
				'methods'  => 'GET',
				'callback' => 'isf_geocode',
			)
		);
	}
);
