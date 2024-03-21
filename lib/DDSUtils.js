class DDSUtils {
    static summarizeHeader(header) {
		

		/*
		
			typedef struct {
				DWORD           dwSize;
				DWORD           dwFlags;
				DWORD           dwHeight;
				DWORD           dwWidth;
				DWORD           dwPitchOrLinearSize;
				DWORD           dwDepth;
				DWORD           dwMipMapCount;
				DWORD           dwReserved1[11];
				DDS_PIXELFORMAT ddspf; //8xDWORD
				DWORD           dwCaps;
				DWORD           dwCaps2;
				DWORD           dwCaps3;
				DWORD           dwCaps4;
				DWORD           dwReserved2;
				} DDS_HEADER;
		*/
		const dwSize = header.readUInt32LE(1 * 4)
		const dwFlags = header.readUInt32LE(2 * 4);	

		const dwHeight = header.readUInt32LE(3 * 4);
		const dwWidth = header.readUInt32LE(4 * 4);
		const dwPitchOrLinearSize =	header.readUInt32LE(5 * 4);	
		const dwDepth= header.readUInt32LE(6 * 4);
		const dwMipMapCount= header.readUInt32LE(7 * 4);
		const dwReserved1= header.readUInt32LE(8 * 4);
		//const ddspf= header.readUInt32LE(8 * 4);
		const dwCaps= header.readUInt32LE(17 * 4);
		const dwCaps2= header.readUInt32LE(18 * 4);
		const dwCaps3= header.readUInt32LE(19 * 4);
		const dwCaps4= header.readUInt32LE(20 * 4);
		const dwReserved2= header.readUInt32LE(21 * 4);

		const DDS_PIXELFORMAT_OFFSET = (1 + 18) * 4;
		const DDS_PIXELFORMAT =  header.slice(DDS_PIXELFORMAT_OFFSET, DDS_PIXELFORMAT_OFFSET + 32);
		/*
			struct DDS_PIXELFORMAT {
			DWORD dwSize;
			DWORD dwFlags;
			DWORD dwFourCC;
			DWORD dwRGBBitCount;
			DWORD dwRBitMask;
			DWORD dwGBitMask;
			DWORD dwBBitMask;
			DWORD dwABitMask;
			};
					
		*/			

		function parsePixelFormatFlags(flags){
			return {
				DDPF_ALPHAPIXELS: !!(flags & 0x1),	//Texture contains alpha data; dwRGBAlphaBitMask contains valid data. 	0x1
				DDPF_ALPHA: !!(flags & 0x2), 	//Used in some older DDS files for alpha channel only uncompressed data (dwRGBBitCount contains the alpha channel bitcount; dwABitMask contains valid data) 	0x2
				DDPF_FOURCC: !!(flags & 0x4), 	//Texture contains compressed RGB data; dwFourCC contains valid data. 	0x4
				DDPF_RGB: !!(flags & 0x40),	//Texture contains uncompressed RGB data; dwRGBBitCount and the RGB masks (dwRBitMask, dwGBitMask, dwBBitMask) contain valid data. 	0x40
				DDPF_YUV: !!(flags & 0x200), 	//Used in some older DDS files for YUV uncompressed data (dwRGBBitCount contains the YUV bit count; dwRBitMask contains the Y mask, dwGBitMask contains the U mask, dwBBitMask contains the V mask) 	0x200
				DDPF_LUMINANCE: !!(flags & 0x2000), 	//Used in some older DDS files for single channel color uncompressed data (dwRGBBitCount contains the luminance channel bit count; dwRBitMask contains the channel mask). Can be combined with DDPF_ALPHAPIXELS for a two channel DDS file. 	0x20000
			}
		}
		const pixelFormatInfo = {
			dwSize: DDS_PIXELFORMAT.readUInt32LE(0 * 4),
			dwFlags: parsePixelFormatFlags(DDS_PIXELFORMAT.readUInt32LE(1 * 4)),
			dwFourCC: DDS_PIXELFORMAT.readUInt32LE(2 * 4),
			dwRGBBitCount: DDS_PIXELFORMAT.readUInt32LE(3 * 4),
			dwRBitMask: DDS_PIXELFORMAT.readUInt32LE(4 * 4),
			dwGBitMask: DDS_PIXELFORMAT.readUInt32LE(5 * 4),
			dwBBitMask: DDS_PIXELFORMAT.readUInt32LE(6 * 4),
			dwABitMask: DDS_PIXELFORMAT.readUInt32LE(7 * 4),
		}

		function getDXGIFormat(){
			if(pixelFormatInfo.dwFlags.DDPF_RGB){
				function ISBITMASK(r, g, b, a) {return pixelFormatInfo.dwRBitMask == r && pixelFormatInfo.dwGBitMask == g && pixelFormatInfo.dwBBitMask == b && pixelFormatInfo.dwABitMask == a};
				if(pixelFormatInfo.dwRGBBitCount == 32){
					if (ISBITMASK(0x000000ff, 0x0000ff00, 0x00ff0000, 0xff000000))
					{
						return "DXGI_FORMAT_R8G8B8A8_UNORM";
					}

					if (ISBITMASK(0x00ff0000, 0x0000ff00, 0x000000ff, 0xff000000))
					{
						return "DXGI_FORMAT_B8G8R8A8_UNORM";
					}

					if (ISBITMASK(0x00ff0000, 0x0000ff00, 0x000000ff, 0x00000000))
					{
						return "DXGI_FORMAT_B8G8R8X8_UNORM";
					}

					// No DXGI format maps to ISBITMASK(0x000000ff, 0x0000ff00, 0x00ff0000, 0x00000000) aka D3DFMT_X8B8G8R8

					// Note that many common DDS reader/writers (including D3DX) swap the
					// the RED/BLUE masks for 10:10:10:2 formats. We assumme
					// below that the 'backwards' header mask is being used since it is most
					// likely written by D3DX. The more robust solution is to use the 'DX10'
					// header extension and specify the DXGI_FORMAT_R10G10B10A2_UNORM format directly

					// For 'correct' writers, this should be 0x000003ff, 0x000ffc00, 0x3ff00000 for RGB data
					if (ISBITMASK(0x3ff00000, 0x000ffc00, 0x000003ff, 0xc0000000))
					{
						return "DXGI_FORMAT_R10G10B10A2_UNORM";
					}

					// No DXGI format maps to ISBITMASK(0x000003ff, 0x000ffc00, 0x3ff00000, 0xc0000000) aka D3DFMT_A2R10G10B10

					if (ISBITMASK(0x0000ffff, 0xffff0000, 0x00000000, 0x00000000))
					{
						return "DXGI_FORMAT_R16G16_UNORM";
					}

					if (ISBITMASK(0xffffffff, 0x00000000, 0x00000000, 0x00000000))
					{
						// Only 32-bit color channel format in D3D9 was R32F.
						return "DXGI_FORMAT_R32_FLOAT"; // D3DX writes this out as a FourCC of 114.
					}
				} else if(pixelFormatInfo.dwRGBBitCount == 16){
					if (ISBITMASK(0x7c00, 0x03e0, 0x001f, 0x8000))
					{
						return "DXGI_FORMAT_B5G5R5A1_UNORM";
					}
					if (ISBITMASK(0xf800, 0x07e0, 0x001f, 0x0000))
					{
						return "DXGI_FORMAT_B5G6R5_UNORM";
					}
		
					// No DXGI format maps to ISBITMASK(0x7c00, 0x03e0, 0x001f, 0x0000) aka D3DFMT_X1R5G5B5.
					if (ISBITMASK(0x0f00, 0x00f0, 0x000f, 0xf000))
					{
						return "DXGI_FORMAT_B4G4R4A4_UNORM";
					}
				}
			}
		}
		
		let DXGIFormat = getDXGIFormat();

		return {
			pixelFormatInfo: pixelFormatInfo,
			DXGIFormat: DXGIFormat,
			width: dwWidth,
			height: dwHeight
		}
	}

    static correctFromDXGI(imageData, DXGIFormat) {
        if(DXGIFormat == "DXGI_FORMAT_B8G8R8A8_UNORM"){
            //red and blue need to be switched
            for(let i = 0; i < imageData.length; i+=4){
                let tmp = imageData[i];
                imageData[i] = imageData[i + 2];
                imageData[i + 2] = tmp;
            }
        }//TODO: add support for other formats
        return imageData;
    }   
}

module.exports = DDSUtils;