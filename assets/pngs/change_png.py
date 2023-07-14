import sys
import os
import numpy as np
from PIL import Image

def get_defined_area(image):
    width, height = image.size
    image_array = np.array(image)
    print("shape of image=", image_array.shape, ", width:", width, ", height:", height)
    # Calculate the maximum values along each column
    col_max = np.sum(np.sum(image_array[:,:,:], axis=0), axis=1)
    print("col_max.shape=", col_max.shape)
    # Calculate the maximum values along each row
    row_max = np.sum(np.sum(image_array[:,:,:], axis=1), axis=1)
    print("row_max.shape=", row_max.shape)
    nonzero_col_indices = np.nonzero(col_max)
    # print("col_max:", col_max)
    # print("nonzero_col_indices.shape=", np.shape(nonzero_col_indices[0]))
    # print("nonzero_col_indices=", nonzero_col_indices)
    first_col = nonzero_col_indices[0][0]
    last_col = nonzero_col_indices[0][-1]
    # Find the first and last non-zero values in row_max
    nonzero_row_indices = np.nonzero(row_max)
    #print("row_max:", row_max)
    first_row = nonzero_row_indices[0][0]
    last_row = nonzero_row_indices[0][-1]
    print("first_col:",first_col,", first_row:",first_row)
    print("last_col:",last_col,", last_row:",last_row)
    return first_col, last_col, first_row, last_row

def resize_image(image, percent=None, width=None, height=None):
    image_format = image.format
    
    # Calculate the new size based on the given percentage
    if percent is not None:
        percent /= 100.0
        new_size = tuple(int(dim * percent) for dim in image.size)
    else:
        # Calculate the new size based on the given width and height
        if width is not None and height is not None:
            new_size = (width, height)
        else:
            raise ValueError("Please provide either a percentage or both width and height values.")
    
    resized_image = image.resize(new_size)
    return resized_image

def change_png(image_path, image_name, pad_percent, replace, save_base, percent=None, width=None, height=None):
    # Load the image
    full_path = os.path.join(image_path, image_name)
    image = Image.open(full_path)
    
    # Get the original width and height
    width, height = image.size
   
    print("round1:")
    first_col, last_col, first_row, last_row = get_defined_area(image)

    crop_left = max(0, first_col)
    crop_right = min(last_col, width)  # Compare with width instead of last_col
    crop_top = max(0, first_row)
    crop_bottom = min(last_row, height)  # Compare with height instead of last_row

    print("crop_left:", crop_left, ", crop_top:", crop_top)
    print("crop_right:", crop_right, ", crop_bottom:", crop_bottom)

    # Crop the image based on the clean rows and columns
    image = image.crop((crop_left, crop_top, crop_right, crop_bottom))
    print("round2:")
    first_col, last_col, first_row, last_row = get_defined_area(image)

    # Save the modified image
    if save_base:
        base_image_path = os.path.join(image_path, "base_" + image_name)
        image.save(base_image_path)
        print(f"Base image saved to: {base_image_path}")
    
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
    new_image_path = full_path if replace else os.path.join(image_path, "modified_" + image_name)
    new_image.save(new_image_path)
    
    print(f"Modified image saved to: {new_image_path}")

    if (percent!=None):
        new_image = resize_image(new_image, percent=percent)
        new_image_path = full_path if replace else os.path.join(image_path, "resized_" + image_name)
        new_image.save(new_image_path)
        print(f"Resized image saved to: {new_image_path}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Please provide the path to the PNG image and the padding percentage.")
        sys.exit(1)
    
    print(len(sys.argv))
    for i in range(len(sys.argv)):
        print(i,sys.argv[i])
    image_path = sys.argv[1]
    image_name = sys.argv[2]
    pad_percent = float(sys.argv[3])
    replace = sys.argv[4].lower() == "true" if len(sys.argv) > 4 else False
    save_base = sys.argv[5].lower() == "true" if len(sys.argv) > 5 else False
    percent = None if len(sys.argv) < 6 else float(sys.argv[6])

    print("image_path:", image_path, "image_name:", image_name, ", pad_percent:", pad_percent, ", replace:", replace, ", save_base:", save_base)
    change_png(image_path, image_name, pad_percent, replace, save_base, percent=percent)
