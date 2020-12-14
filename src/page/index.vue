<template></template>
<script>
export default {
	mounted() {
		let path, views = sessionStorage.getItem('views')
		if (sessionStorage.getItem('userId') && sessionStorage.getItem('token') && views) {
			views = views.split(',')
			let routes = this.$router.options.routes
			for(let v of views) {
				for(let i of routes) {
					if(!path && i.path === '/' + v) {
						path = i.path
						break
						break
					}
				}
			}
		} else {
			path = '/login'
		}
		this.$router.push({ path })
	}
}
</script>