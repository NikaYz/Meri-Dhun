'use client';
import React, { useState, useEffect } from 'react';
import { Play, Music, Users, QrCode, TrendingUp, Heart, Zap, Star, Volume2, Headphones, Crown, Trophy, ArrowRight, Sparkles, Radio, Mic2, Disc3 } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(0);
  const [glowEffect, setGlowEffect] = useState(false);

  const indianSongs = [
    { title: "Kesariya", artist: "Arijit Singh", votes: 1247, genre: "Bollywood" },
    { title: "Raataan Lambiyan", artist: "Tanishk Bagchi", votes: 892, genre: "Romance" },
    { title: "Manike", artist: "Yohani", votes: 756, genre: "Pop" },
    { title: "Param Sundari", artist: "Shreya Ghoshal", votes: 634, genre: "Classical" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSong((prev) => (prev + 1) % indianSongs.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [indianSongs.length]);

  useEffect(() => {
    const glowInterval = setInterval(() => {
      setGlowEffect(true);
      setTimeout(() => setGlowEffect(false), 1000);
    }, 4000);
    return () => clearInterval(glowInterval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-green-500/10 to-green-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-green-400/10 to-green-300/10 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-green-600/10 to-green-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-gradient-to-r from-green-300/10 to-green-200/10 rounded-full blur-xl animate-bounce delay-500"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:px-12 bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center transition-all duration-300 ${glowEffect ? 'shadow-lg shadow-green-500/50 scale-110' : ''}`}>
            <Music className="w-7 h-7 text-black" />
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">
            Meri Dhun
          </span>
        </div>
        <button
          onClick={onGetStarted}
          className="bg-gradient-to-r from-green-500 to-green-400 hover:from-green-400 hover:to-green-300 text-black font-semibold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
        >
          Get Started
        </button>
      </nav>

      {/* Hero Section */}
      <div className="relative px-6 lg:px-12 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-green-400 font-semibold">
                  <Sparkles className="w-5 h-5" />
                  <span>India&apos;s Premier Music Experience</span>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="block text-white">Where Music</span>
                  <span className="block bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                    Meets Democracy
                  </span>
                  <span className="block text-white">In Real Time</span>
                </h1>
                <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl">
                  Transform any venue into an interactive musical democracy. Let your audience discover, vote, and boost their favorite tracks in real-time.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onGetStarted}
                  className="group bg-gradient-to-r from-green-500 to-green-400 hover:from-green-400 hover:to-green-300 text-black font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-lg hover:shadow-green-500/25"
                >
                  <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>Start Your Journey</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="border-2 border-green-500 hover:border-green-400 hover:bg-green-500/10 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 flex items-center justify-center space-x-2">
                  <Radio className="w-5 h-5" />
                  <span>Watch Demo</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-8 text-center lg:text-left">
                <div className="space-y-2">
                  <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                    50K+
                  </div>
                  <div className="text-gray-400 font-medium">Songs Available</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                    1000+
                  </div>
                  <div className="text-gray-400 font-medium">Active Venues</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                    99.9%
                  </div>
                  <div className="text-gray-400 font-medium">Uptime</div>
                </div>
              </div>
            </div>

            {/* Interactive Music Player Mockup */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-800">
                <div className="space-y-6">
                  {/* Now Playing */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-400 rounded-2xl flex items-center justify-center shadow-lg">
                        <Disc3 className="w-10 h-10 text-black animate-spin" style={{ animationDuration: '3s' }} />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg">{indianSongs[currentSong].title}</h3>
                      <p className="text-gray-400">{indianSongs[currentSong].artist}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                          {indianSongs[currentSong].genre}
                        </span>
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-gray-400">{indianSongs[currentSong].votes} votes</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-400 rounded-full flex items-center justify-center hover:from-green-400 hover:to-green-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      {isPlaying ? (
                        <div className="flex space-x-1">
                          <div className="w-1 h-4 bg-black rounded animate-pulse"></div>
                          <div className="w-1 h-4 bg-black rounded animate-pulse delay-100"></div>
                        </div>
                      ) : (
                        <Play className="w-7 h-7 text-black ml-1" />
                      )}
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="w-1/3 h-2 bg-gradient-to-r from-green-500 to-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>1:23</span>
                      <span className="flex items-center space-x-1">
                        <Volume2 className="w-3 h-3" />
                        <span>LIVE</span>
                      </span>
                      <span>4:15</span>
                    </div>
                  </div>

                  {/* Queue Preview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-300 flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>Top Requests</span>
                      </h4>
                      <div className="flex items-center space-x-1 text-xs text-green-400">
                        <Zap className="w-3 h-3" />
                        <span>Live Voting</span>
                      </div>
                    </div>
                    {indianSongs.slice(1, 4).map((song, index) => (
                      <div key={index} className="flex items-center justify-between text-sm bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800/70 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-400 rounded-lg flex items-center justify-center text-xs font-bold text-black">
                            {index + 2}
                          </div>
                          <div>
                            <p className="text-white font-medium">{song.title}</p>
                            <p className="text-gray-400 text-xs">{song.artist}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="text-gray-400 font-medium">{song.votes}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-green-500 to-green-400 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                <Crown className="w-10 h-10 text-black" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-r from-green-400 to-green-300 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                <Headphones className="w-8 h-8 text-black" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative px-6 lg:px-12 py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-2 text-green-400 font-semibold mb-4">
              <Star className="w-5 h-5" />
              <span>How It Works</span>
              <Star className="w-5 h-5" />
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="text-white">Experience </span>
              <span className="bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">Meri Dhun</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Three simple steps to transform your venue into an interactive music democracy
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: QrCode,
                title: "Scan & Join",
                description: "Guests scan a QR code that refreshes every 30 seconds for secure access. No app downloads required - just instant musical connection.",
                color: "from-green-400 to-green-500",
                bgColor: "from-green-500/10 to-green-400/10",
                borderColor: "border-green-500/20"
              },
              {
                icon: Music,
                title: "Discover & Vote",
                description: "Browse thousands of songs, add favorites to the queue, and vote for what plays next. Your voice shapes the musical journey.",
                color: "from-green-500 to-green-600",
                bgColor: "from-green-600/10 to-green-500/10",
                borderColor: "border-green-600/20"
              },
              {
                icon: Trophy,
                title: "Boost & Celebrate",
                description: "Use boost points to prioritize your favorite tracks or make special dedications that everyone will hear and remember.",
                color: "from-green-600 to-green-700",
                bgColor: "from-green-700/10 to-green-600/10",
                borderColor: "border-green-700/20"
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className={`bg-gradient-to-br ${feature.bgColor} backdrop-blur-xl rounded-3xl p-8 border ${feature.borderColor} hover:border-opacity-40 transition-all duration-500 transform hover:-translate-y-4 hover:shadow-2xl hover:shadow-green-500/10`}>
                  <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                    <feature.icon className="w-10 h-10 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-green-400 group-hover:to-green-300 group-hover:bg-clip-text transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-400/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative px-6 lg:px-12 py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "50K+", label: "Songs", icon: Music },
              { number: "10K+", label: "Active Users", icon: Users },
              { number: "1000+", label: "Venues", icon: Mic2 },
              { number: "99.9%", label: "Uptime", icon: Zap }
            ].map((stat, index) => (
              <div key={index} className="group space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-400 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                  <stat.icon className="w-8 h-8 text-black" />
                </div>
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-400 font-medium group-hover:text-gray-300 transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative px-6 lg:px-12 py-20 bg-gradient-to-r from-green-600 via-green-500 to-green-400 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="space-y-8">
            <div className="flex items-center justify-center space-x-2 text-black/80 font-semibold">
              <Sparkles className="w-5 h-5" />
              <span>Ready to Begin?</span>
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-black leading-tight">
              Transform Your Venue Into a
              <span className="block">Musical Democracy</span>
            </h2>
            <p className="text-xl text-black/90 max-w-3xl mx-auto leading-relaxed">
              Join thousands of venues already using Meri Dhun to create unforgettable musical experiences that bring people together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="group bg-black text-green-400 font-bold px-12 py-4 rounded-full transition-all duration-300 transform hover:scale-105 text-lg shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3"
              >
                <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>Start Your Musical Journey</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border-2 border-black/30 hover:border-black hover:bg-black/10 text-black font-semibold px-8 py-4 rounded-full transition-all duration-300 flex items-center justify-center space-x-2">
                <Radio className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative px-6 lg:px-12 py-12 bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                <Music className="w-6 h-6 text-black" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                Meri Dhun
              </span>
            </div>
            <div className="text-gray-400 text-sm text-center md:text-right">
              <p>© 2025 Meri Dhun. All rights reserved.</p>
              <p className="mt-1">Bringing music democracy to life, one venue at a time.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// "use client"
// import React, { useState, useEffect } from 'react';
// import { Play, Music, Users, QrCode, TrendingUp, Heart, Zap, Star, Volume2, Headphones, Crown, Trophy, ArrowRight, Sparkles, Radio, Mic2, Waves, Disc3 } from 'lucide-react';

// interface LandingPageProps {
//   onGetStarted: () => void;
// }

// export default function LandingPage({ onGetStarted }: LandingPageProps) {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentSong, setCurrentSong] = useState(0);
//   const [glowEffect, setGlowEffect] = useState(false);

//   const indianSongs = [
//     { title: "Kesariya", artist: "Arijit Singh", votes: 1247, genre: "Bollywood" },
//     { title: "Raataan Lambiyan", artist: "Tanishk Bagchi", votes: 892, genre: "Romance" },
//     { title: "Manike", artist: "Yohani", votes: 756, genre: "Pop" },
//     { title: "Param Sundari", artist: "Shreya Ghoshal", votes: 634, genre: "Classical" }
//   ];

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentSong((prev) => (prev + 1) % indianSongs.length);
//     }, 3000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     const glowInterval = setInterval(() => {
//       setGlowEffect(true);
//       setTimeout(() => setGlowEffect(false), 1000);
//     }, 4000);
//     return () => clearInterval(glowInterval);
//   }, []);

//   return (
//     <div className="min-h-screen bg-black text-white overflow-hidden relative">
//       {/* Animated Background Elements */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-green-500/10 to-green-400/10 rounded-full blur-xl animate-pulse"></div>
//         <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-green-400/10 to-green-300/10 rounded-full blur-xl animate-bounce"></div>
//         <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-green-600/10 to-green-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
//         <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-gradient-to-r from-green-300/10 to-green-200/10 rounded-full blur-xl animate-bounce delay-500"></div>
//       </div>

//       {/* Navigation */}
//       <nav className="relative z-10 flex items-center justify-between p-6 lg:px-12 bg-black/50 backdrop-blur-sm border-b border-gray-800">
//         <div className="flex items-center space-x-3">
//           <div className={`w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center transition-all duration-300 ${glowEffect ? 'shadow-lg shadow-green-500/50 scale-110' : ''}`}>
//             <Music className="w-7 h-7 text-black" />
//           </div>
//           <span className="text-3xl font-bold bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">
//             Meri Dhun
//           </span>
//         </div>
//         <button
//           onClick={onGetStarted}
//           className="bg-gradient-to-r from-green-500 to-green-400 hover:from-green-400 hover:to-green-300 text-black font-semibold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
//         >
//           Get Started
//         </button>
//       </nav>

//       {/* Hero Section */}
//       <div className="relative px-6 lg:px-12 py-12 lg:py-20">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             <div className="space-y-8">
//               <div className="space-y-6">
//                 <div className="flex items-center space-x-2 text-green-400 font-semibold">
//                   <Sparkles className="w-5 h-5" />
//                   <span>India's Premier Music Experience</span>
//                 </div>
//                 <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
//                   <span className="block text-white">Where Music</span>
//                   <span className="block bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
//                     Meets Democracy
//                   </span>
//                   <span className="block text-white">In Real Time</span>
//                 </h1>
//                 <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl">
//                   Transform any venue into an interactive musical democracy. Let your audience discover, vote, and boost their favorite tracks in real-time.
//                 </p>
//               </div>

//               <div className="flex flex-col sm:flex-row gap-4">
//                 <button
//                   onClick={onGetStarted}
//                   className="group bg-gradient-to-r from-green-500 to-green-400 hover:from-green-400 hover:to-green-300 text-black font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-lg hover:shadow-green-500/25"
//                 >
//                   <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
//                   <span>Start Your Journey</span>
//                   <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//                 </button>
//                 <button className="border-2 border-green-500 hover:border-green-400 hover:bg-green-500/10 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 flex items-center justify-center space-x-2">
//                   <Radio className="w-5 h-5" />
//                   <span>Watch Demo</span>
//                 </button>
//               </div>

//               <div className="grid grid-cols-3 gap-8 text-center lg:text-left">
//                 <div className="space-y-2">
//                   <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
//                     50K+
//                   </div>
//                   <div className="text-gray-400 font-medium">Songs Available</div>
//                 </div>
//                 <div className="space-y-2">
//                   <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
//                     1000+
//                   </div>
//                   <div className="text-gray-400 font-medium">Active Venues</div>
//                 </div>
//                 <div className="space-y-2">
//                   <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
//                     99.9%
//                   </div>
//                   <div className="text-gray-400 font-medium">Uptime</div>
//                 </div>
//               </div>
//             </div>

//             {/* Interactive Music Player Mockup */}
//             <div className="relative">
//               <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-800">
//                 <div className="space-y-6">
//                   {/* Now Playing */}
//                   <div className="flex items-center space-x-4">
//                     <div className="relative">
//                       <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-400 rounded-2xl flex items-center justify-center shadow-lg">
//                         <Disc3 className="w-10 h-10 text-black animate-spin" style={{ animationDuration: '3s' }} />
//                       </div>
//                       <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
//                         <div className="w-2 h-2 bg-black rounded-full"></div>
//                       </div>
//                     </div>
//                     <div className="flex-1">
//                       <h3 className="font-bold text-white text-lg">{indianSongs[currentSong].title}</h3>
//                       <p className="text-gray-400">{indianSongs[currentSong].artist}</p>
//                       <div className="flex items-center space-x-2 mt-1">
//                         <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
//                           {indianSongs[currentSong].genre}
//                         </span>
//                         <Heart className="w-4 h-4 text-red-500" />
//                         <span className="text-sm text-gray-400">{indianSongs[currentSong].votes} votes</span>
//                       </div>
//                     </div>
//                     <button
//                       onClick={() => setIsPlaying(!isPlaying)}
//                       className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-400 rounded-full flex items-center justify-center hover:from-green-400 hover:to-green-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
//                     >
//                       {isPlaying ? (
//                         <div className="flex space-x-1">
//                           <div className="w-1 h-4 bg-black rounded animate-pulse"></div>
//                           <div className="w-1 h-4 bg-black rounded animate-pulse delay-100"></div>
//                         </div>
//                       ) : (
//                         <Play className="w-7 h-7 text-black ml-1" />
//                       )}
//                     </button>
//                   </div>

//                   {/* Progress Bar */}
//                   <div className="space-y-2">
//                     <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
//                       <div className="w-1/3 h-2 bg-gradient-to-r from-green-500 to-green-400 rounded-full animate-pulse"></div>
//                     </div>
//                     <div className="flex justify-between text-xs text-gray-400">
//                       <span>1:23</span>
//                       <span className="flex items-center space-x-1">
//                         <Volume2 className="w-3 h-3" />
//                         <span>LIVE</span>
//                       </span>
//                       <span>4:15</span>
//                     </div>
//                   </div>

//                   {/* Queue Preview */}
//                   <div className="space-y-3">
//                     <div className="flex items-center justify-between">
//                       <h4 className="text-sm font-semibold text-gray-300 flex items-center space-x-2">
//                         <TrendingUp className="w-4 h-4" />
//                         <span>Top Requests</span>
//                       </h4>
//                       <div className="flex items-center space-x-1 text-xs text-green-400">
//                         <Zap className="w-3 h-3" />
//                         <span>Live Voting</span>
//                       </div>
//                     </div>
//                     {indianSongs.slice(1, 4).map((song, index) => (
//                       <div key={index} className="flex items-center justify-between text-sm bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800/70 transition-colors">
//                         <div className="flex items-center space-x-3">
//                           <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-400 rounded-lg flex items-center justify-center text-xs font-bold text-black">
//                             {index + 2}
//                           </div>
//                           <div>
//                             <p className="text-white font-medium">{song.title}</p>
//                             <p className="text-gray-400 text-xs">{song.artist}</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <Heart className="w-4 h-4 text-red-500" />
//                           <span className="text-gray-400 font-medium">{song.votes}</span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* Floating Elements */}
//               <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-green-500 to-green-400 rounded-full flex items-center justify-center animate-bounce shadow-lg">
//                 <Crown className="w-10 h-10 text-black" />
//               </div>
//               <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-r from-green-400 to-green-300 rounded-full flex items-center justify-center animate-pulse shadow-lg">
//                 <Headphones className="w-8 h-8 text-black" />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Features Section */}
//       <div className="relative px-6 lg:px-12 py-20 bg-gradient-to-b from-black to-gray-900">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-16">
//             <div className="flex items-center justify-center space-x-2 text-green-400 font-semibold mb-4">
//               <Star className="w-5 h-5" />
//               <span>How It Works</span>
//               <Star className="w-5 h-5" />
//             </div>
//             <h2 className="text-4xl lg:text-6xl font-bold mb-6">
//               <span className="text-white">Experience </span>
//               <span className="bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">Meri Dhun</span>
//             </h2>
//             <p className="text-xl text-gray-300 max-w-3xl mx-auto">
//               Three simple steps to transform your venue into an interactive music democracy
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8">
//             {[
//               {
//                 icon: QrCode,
//                 title: "Scan & Join",
//                 description: "Guests scan a QR code that refreshes every 30 seconds for secure access. No app downloads required - just instant musical connection.",
//                 color: "from-green-400 to-green-500",
//                 bgColor: "from-green-500/10 to-green-400/10",
//                 borderColor: "border-green-500/20"
//               },
//               {
//                 icon: Music,
//                 title: "Discover & Vote",
//                 description: "Browse thousands of songs, add favorites to the queue, and vote for what plays next. Your voice shapes the musical journey.",
//                 color: "from-green-500 to-green-600",
//                 bgColor: "from-green-600/10 to-green-500/10",
//                 borderColor: "border-green-600/20"
//               },
//               {
//                 icon: Trophy,
//                 title: "Boost & Celebrate",
//                 description: "Use boost points to prioritize your favorite tracks or make special dedications that everyone will hear and remember.",
//                 color: "from-green-600 to-green-700",
//                 bgColor: "from-green-700/10 to-green-600/10",
//                 borderColor: "border-green-700/20"
//               }
//             ].map((feature, index) => (
//               <div key={index} className="group relative">
//                 <div className={`bg-gradient-to-br ${feature.bgColor} backdrop-blur-xl rounded-3xl p-8 border ${feature.borderColor} hover:border-opacity-40 transition-all duration-500 transform hover:-translate-y-4 hover:shadow-2xl hover:shadow-green-500/10`}>
//                   <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
//                     <feature.icon className="w-10 h-10 text-black" />
//                   </div>
//                   <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-green-400 group-hover:to-green-300 group-hover:bg-clip-text transition-all duration-300">
//                     {feature.title}
//                   </h3>
//                   <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
//                     {feature.description}
//                   </p>
//                 </div>
//                 <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-400/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Stats Section */}
//       <div className="relative px-6 lg:px-12 py-20 bg-gray-900">
//         <div className="max-w-6xl mx-auto text-center">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
//             {[
//               { number: "50K+", label: "Songs", icon: Music },
//               { number: "10K+", label: "Active Users", icon: Users },
//               { number: "1000+", label: "Venues", icon: Mic2 },
//               { number: "99.9%", label: "Uptime", icon: Zap }
//             ].map((stat, index) => (
//               <div key={index} className="group space-y-4">
//                 <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-400 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
//                   <stat.icon className="w-8 h-8 text-black" />
//                 </div>
//                 <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
//                   {stat.number}
//                 </div>
//                 <div className="text-gray-400 font-medium group-hover:text-gray-300 transition-colors duration-300">
//                   {stat.label}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* CTA Section */}
//       <div className="relative px-6 lg:px-12 py-20 bg-gradient-to-r from-green-600 via-green-500 to-green-400 overflow-hidden">
//         <div className="absolute inset-0 bg-black/20"></div>
//         <div className="relative max-w-5xl mx-auto text-center">
//           <div className="space-y-8">
//             <div className="flex items-center justify-center space-x-2 text-black/80 font-semibold">
//               <Sparkles className="w-5 h-5" />
//               <span>Ready to Begin?</span>
//               <Sparkles className="w-5 h-5" />
//             </div>
//             <h2 className="text-4xl lg:text-6xl font-bold text-black leading-tight">
//               Transform Your Venue Into a
//               <span className="block">Musical Democracy</span>
//             </h2>
//             <p className="text-xl text-black/90 max-w-3xl mx-auto leading-relaxed">
//               Join thousands of venues already using Meri Dhun to create unforgettable musical experiences that bring people together.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <button
//                 onClick={onGetStarted}
//                 className="group bg-black text-green-400 font-bold px-12 py-4 rounded-full transition-all duration-300 transform hover:scale-105 text-lg shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3"
//               >
//                 <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
//                 <span>Start Your Musical Journey</span>
//                 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//               </button>
//               <button className="border-2 border-black/30 hover:border-black hover:bg-black/10 text-black font-semibold px-8 py-4 rounded-full transition-all duration-300 flex items-center justify-center space-x-2">
//                 <Radio className="w-5 h-5" />
//                 <span>Watch Demo</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Footer */}
//       <footer className="relative px-6 lg:px-12 py-12 bg-black border-t border-gray-800">
//         <div className="max-w-7xl mx-auto">
//           <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
//             <div className="flex items-center space-x-3">
//               <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
//                 <Music className="w-6 h-6 text-black" />
//               </div>
//               <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
//                 Meri Dhun
//               </span>
//             </div>
//             <div className="text-gray-400 text-sm text-center md:text-right">
//               <p>© 2025 Meri Dhun. All rights reserved.</p>
//               <p className="mt-1">Bringing music democracy to life, one venue at a time.</p>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }