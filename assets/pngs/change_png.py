import sys
from PIL import Image

def change_png(image_path, pad_percent):
    # Load the image
    image = Image.open(image_path)
    
    # Get the original width and height
    width, height = image.size
    
    # Find the top and bottom clean rows
    top_clean_row = 0
    bottom_clean_row = height - 1
    
    for y in range(height):
        row_pixels = image.getpixel((0, y))  # Get the pixel values of the first column
        if any(channel != 0 for channel in row_pixels):
            top_clean_row = y
            break
    
    for y in range(height - 1, top_clean_row, -1):
        row_pixels = image.getpixel((0, y))  # Get the pixel values of the first column
        if any(channel != 0 for channel in row_pixels):
            bottom_clean_row = y
            break
    
    # Crop the image to remove clean rows and columns
    left_clean_col = 0
    right_clean_col = width - 1
    
    for x in range(width):
        col_pixels = image.getpixel((x, 0))  # Get the pixel values of the first row
        if any(channel != 0 for channel in col_pixels):
            left_clean_col = x
            break
    
    for x in range(width - 1, left_clean_col, -1):
        col_pixels = image.getpixel((x, 0))  # Get the pixel values of the first row
        if any(channel != 0 for channel in col_pixels):
            right_clean_col = x
            break
    
    # Crop the image based on the clean rows and columns
    image = image.crop((left_clean_col, top_clean_row, right_clean_col + 1, bottom_clean_row + 1))
    
    # Get the new width and height
    new_width, new_height = image.size
    
    # Calculate the new dimensions with padding percentage
    pad_fraction = pad_percent / 100
    pad_top = int(new_height * pad_fraction)
    pad_bottom = int(new_height * pad_fraction)
    final_height = new_height + pad_top + pad_bottom
    final_width = new_width + pad_top + pad_bottom
    
    # Create a new blank image with the final dimensions
    new_image = Image.new("RGBA", (final_width, final_height), (0, 0, 0, 0))
    
    # Calculate the position to center the original image vertically and horizontally
    x_offset = (final_width - new_width) // 2
    y_offset = (final_height - new_height) // 2
    
    # Paste the original image onto the new image
    new_image.paste(image, (x_offset, y_offset))
    
    # Save the modified image
    new_image_path = "modified_" + image_path
    new_image.save(new_image_path)
    
    print(f"Modified image saved to: {new_image_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Please provide the path to the PNG image and the padding percentage.")
        sys.exit(1)
    
    image_path = sys.argv[1]
    pad_percent = float(sys.argv[2])
    change_png(image_path, pad_percent)
