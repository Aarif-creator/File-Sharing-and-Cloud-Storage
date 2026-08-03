<meta property="og:site_name" content="{{ settings('branding.site_name') }}" />
<meta property="twitter:card" content="summary" />
<meta property="og:type" content="website" />
<title>{{ $data['entry']['name'] }} - {{ settings('branding.site_name') }}</title>
<meta
    property="og:title"
    content="{{ $data['entry']['name'] }} - {{ settings('branding.site_name') }}"
/>
<meta property="og:url" content="{{ url('drive/s/' . $data['hash']) }}" />
<link rel="canonical" href="{{ url('drive/s/' . $data['hash']) }}" />

<meta
    property="og:description"
    content="Shared with {{ settings('branding.site_name') }}"
/>
<meta
    name="description"
    content="Shared with {{ settings('branding.site_name') }}"
/>
