<script lang="ts">
	import { onMount } from 'svelte';
	import axios from 'axios';

	export const prerender = true
	let mediaRecorder: MediaRecorder;
	let audioURL = '';
	let blob: Blob;
	let transcribedAudio = '';
	let transcribedAudioSrc = '';
	let error = '';

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
		error = '';
		audioURL = '';
		mediaRecorder.start();
		mediaRecorder = mediaRecorder;
	};

	const stopRecording = () => {
		mediaRecorder.stop();
		mediaRecorder = mediaRecorder;

		setTimeout(submitRecording, 100);
	};

	const submitRecording = () => {
      let formData = new FormData();
      formData.append('audio', blob);
			axios({
          method: "POST",
          url: 'http://localhost:8000/submit_audio',
          data: formData
      })
			.then(function (response) {
				console.log(response);
				transcribedAudio = response.data.text;
				transcribedAudioSrc = 'http://localhost:8000/' + response.data.audio;
			})
			.catch(function (err) {
				console.log(err);
				error = err;
			});
	};

	const deleteRecording = () => {
		audioURL = '';
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


	const playResponse = () => {
		var audio = new Audio(transcribedAudioSrc);
		audio.play();
	}

	$: console.warn('transcribedAudioSrc', transcribedAudioSrc);
	onMount(async () => {
		create();
	});
</script>

<div style="display: flex; flex-direction: column; justify-content: center; align-items: center">
	<h1>MTG Assistant</h1>

	{#if !transcribedAudioSrc && audioURL && !error}
	<div>
		<img src='/ajax-loader.gif' alt='Recording Mic Icon' style="height: 80px;"/>
	</div>
	{:else}
	<div style="margin: 20px">
		<button on:mousedown={startRecording} on:mouseup={stopRecording} style={"border-radius: 100px; height: 70px; " + (mediaRecorder?.state === 'recording' ? 'background-color: pink;' : '') }>
			<img src='/26312.png' alt='Recording Mic Icon' style="height: 40px;"/>
		</button>
	</div>
	{/if}

	{#if error} <p style="color: red;">{error}</p> {/if}

	<section class="sound-clips" />
	{#if transcribedAudioSrc}
		<button on:click={playResponse}>Play Response</button>
	{/if}

	<div>
		{transcribedAudio}
	</div>
</div>
