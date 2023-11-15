import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea, CardActions } from "@mui/material";
import Button from "@mui/material/Button";
import { defaultImageUrl } from "../../config_and_helpers/config";

const ItemCard = ({ props }) => {
  const imageUrl = props.image || defaultImageUrl;

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea onClick={props.imageClick}>
        <CardMedia component="img" height="200" image={imageUrl} />
        <CardContent>
          <Typography gutterBottom variant="h4" component="div">
            {props.name}
          </Typography>
          <Typography gutterBottom variant="subtitle1" component="div">
            {props.catNum}
          </Typography>
          <Typography variant="body1" color="text.secondary" component="div">
            <div>
              <span style={{ fontWeight: "bold" }}>Supplier:</span>
              {props.supplier}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Manufacturer:</span>
              {props.manufacturer}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Category:</span>
              {props.category}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Volume:</span> {props.volume}
            </div>
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button size="small" color="primary">
          Share
        </Button>
      </CardActions>
    </Card>
  );
};
export default ItemCard;
