<script lang="ts">
	import { onMount } from 'svelte';
	import axios from 'axios';

  // @ts-ignore: this
  // Blob.prototype[Symbol.toStringTag] = 'Blob'
  // File.prototype[Symbol.toStringTag] = 'File'


	let mediaRecorder: MediaRecorder;
	let audioURL = '';
	let blob: Blob;
	let transcribedAudio = '';


	const create = () => {
		if (window?.navigator?.mediaDevices?.getUserMedia) {
			window.navigator.mediaDevices
				.getUserMedia({
					audio: true
				})
				.then((stream) => {
					const options = {
						// mimeType : 'audio/webm;codecs=opus'
					} as MediaRecorderOptions;
					mediaRecorder = new MediaRecorder(stream, options);
					setupMediaRecorder(mediaRecorder);
				})
				.catch((err) => {
					console.error(`There was an error while getting user media: ${err}`);
				});
		} else {
			console.log('Window, navigator, mediaDevices, or getUserMedia was not found.');
		}
	};

	const startRecording = () => {
		mediaRecorder.start();
		mediaRecorder = mediaRecorder;
	};

	const stopRecording = () => {
		mediaRecorder.stop();
		mediaRecorder = mediaRecorder;
	};

	const submitRecording = () => {
		// axios
		// 	.post('http://localhost:8000/submit_audio', {
		// 		blob: blob
		// 	}, {
    //     transformRequest: (d) => d
    //   })
      let formData = new FormData();
      formData.append('audio', blob);


			// var reader = new FileReader();
			// reader.readAsDataURL(blob);
			// reader.onloadend = function () {
			// 	var base64String = reader.result;
			// 	console.log('Base64 String - ', base64String);

			// 	// Simply Print the Base64 Encoded String,
			// 	// without additional data: Attributes.
			// 	// console.log('Base64 String without Tags- ', base64String?.substr(base64String.indexOf(', ') + 1));
			// }




      // axios({
      //     method: "POST",
      //     url: 'http://localhost:8000/submit_audio',
      //     data: blob,
			// 		headers: {
			// 			'content-type': 'audio/ogg'
			// 		}
      // })

			axios({
          method: "POST",
          url: 'http://localhost:8000/submit_audio',
          data: formData
      })

			.then(function (response) {
				console.log(response);
				transcribedAudio = response.data.text;
			})
			.catch(function (error) {
				console.log(error);
			});
	};

	const deleteRecording = () => {
		audioURL = '';
		transcribedAudio = '';
	};

	const setupMediaRecorder = (mRecorder: MediaRecorder) => {
		let chunks: Blob[] = [];

		mRecorder.ondataavailable = (e) => {
			chunks.push(e.data);
		};

		mRecorder.onstop = (e) => {
			blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
			chunks = [];
			audioURL = window.URL.createObjectURL(blob);
		};
	};

	// $: console.warn('mediaRecorder?.state', mediaRecorder?.state);

  $: console.warn('blob', blob);

	onMount(async () => {
		create();
	});
</script>

<div style="display: flex; flex-direction: column; justify-content: center; align-items: center">
	<h1>MTG Assistant</h1>
	<div style="margin: 20px">
		<button on:click={startRecording} disabled={!!audioURL || mediaRecorder?.state === 'recording'}
			>{'start recording'}</button
		>
		<button on:click={stopRecording} disabled={mediaRecorder?.state !== 'recording'}
			>{'stop recording'}</button
		>
		<button on:click={deleteRecording} disabled={!audioURL}>{'delete recording'}</button>
		<button on:click={submitRecording} disabled={!audioURL}>{'submit recording'}</button>
	</div>
	{#if mediaRecorder?.state === 'recording'}
		<div
			style="background-color: pink; width: fit-content; margin: 20px; border-radius: 20px; padding: 10px"
		>
			{#each Array(10) as _, i}
				<span>{'-'}</span>
			{/each}
			<span>{'Recording'}</span>
			{#each Array(10) as _, i}
				<span>{'-'}</span>
			{/each}
		</div>
	{/if}

	<section class="sound-clips" />
	{#if audioURL}
		<audio controls src={audioURL} style="margin: 20px" />
	{/if}

	<div>
		{transcribedAudio}
	</div>
</div>
