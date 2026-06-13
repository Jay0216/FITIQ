import React from "react"

const HeadingText: React.FC = () => {

    return(
        
      <div className="text-center text-white font-[Montserrat] font-semibold">
  <h1 className="text-[50px] md:text-[64px] mb-6">
    <span className="text-[#009688]">FitIQ</span>: Scan, Track, Achieve.
  </h1>
  <button
    className="bg-[#009688] hover:bg-[#00796B] text-white px-8 py-3 rounded-lg transition duration-300"
  >
    Discover
  </button>
</div>

    )
}


export default HeadingText