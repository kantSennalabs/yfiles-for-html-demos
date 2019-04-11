/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
import {
  EdgeSelectionIndicatorInstaller,
  EdgeStyleBase,
  GeneralPath,
  IArrow,
  IEdge,
  ISelectionIndicatorInstaller,
  PolylineEdgeStyle,
  SvgVisual
} from 'yfiles'

/**
 * This class is an example for a custom edge style based on {@link EdgeStyleBase}.
 */
export default class MySimpleEdgeStyle extends EdgeStyleBase {
  /**
   * Initializes a new instance of the {@link MySimpleEdgeStyle} class.
   */
  constructor() {
    super()
    this.$arrows = IArrow.DEFAULT
    this.$pathThickness = 3
  }

  /**
   * Gets the thickness of the edge.
   * @type {number}
   */
  get pathThickness() {
    return this.$pathThickness
  }

  /**
   * Sets the thickness of the edge.
   * @type {number}
   */
  set pathThickness(value) {
    this.$pathThickness = value
  }

  /**
   * Gets the arrows drawn at the beginning and at the end of the edge.
   * @type {IArrow}
   */
  get arrows() {
    return this.$arrows
  }

  /**
   * Sets the arrows drawn at the beginning and at the end of the edge.
   * @type {IArrow}
   */
  set arrows(value) {
    this.$arrows = value
  }

  // //////////////////////////////////////////////////
  // ////////////// New in this sample ////////////////
  // //////////////////////////////////////////////////

  /**
   * Determines whether the visual representation of the edge has been hit at the given location.
   * Overridden method to include the {@link MySimpleEdgeStyle#pathThickness} and the HitTestRadius specified in the
   * context in the calculation.
   * @see Overrides {@link EdgeStyleBase#isHit}
   * @return {boolean}
   */
  isHit(canvasContext, p, edge) {
    // Use the convenience method in GeneralPath
    return this.getPath(edge).pathContains(
      p,
      canvasContext.hitTestRadius + this.pathThickness * 0.5
    )
  }

  /**
   * Creates the visual for an edge.
   * @see Overrides {@link EdgeStyleBase#createVisual}
   * @return {Visual}
   */
  createVisual(context, edge) {
    // This implementation creates a CanvasContainer and uses it for the rendering of the edge.
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    // Get the necessary data for rendering of the edge
    const cache = this.createRenderDataCache(context, edge)
    // Render the edge
    this.render(context, edge, g, cache)
    return new SvgVisual(g)
  }

  /**
   * Re-renders the edge using the old visual for performance reasons.
   * @see Overrides {@link EdgeStyleBase#updateVisual}
   * @return {Visual}
   */
  updateVisual(context, oldVisual, edge) {
    const container = oldVisual.svgElement
    // get the data with which the oldvisual was created
    const oldCache = container['data-renderDataCache']
    // get the data for the new visual
    const newCache = this.createRenderDataCache(context, edge)

    // check if something changed
    if (newCache.equals(newCache, oldCache)) {
      // nothing changed, return the old visual
      return oldVisual
    }
    // something changed - re-render the visual
    while (container.hasChildNodes()) {
      // remove all children
      container.removeChild(container.firstChild)
    }
    this.render(context, edge, container, newCache)
    return oldVisual
  }

  /**
   * Creates an object containing all necessary data to create an edge visual.
   * @return {object}
   */
  createRenderDataCache(context, edge) {
    // Get the owner node's color
    const node = edge.sourcePort.owner
    let color
    const nodeStyle = node.style
    if (typeof nodeStyle.getNodeColor === 'function') {
      color = nodeStyle.getNodeColor(node)
    } else {
      color = '#0082b4'
    }

    return {
      thickness: this.pathThickness,
      color,
      path: this.getPath(edge),
      arrows: this.arrows,
      equals: (self, other) =>
        self.thickness === other.thickness &&
        self.color === other.color &&
        self.path.hasSameValue(other.path) &&
        self.arrows.equals(other.arrows)
    }
  }

  /**
   * Creates the visual appearance of an edge.
   */
  render(context, edge, container, cache) {
    const g = container

    // store information with the visual on how we created it
    g['data-renderDataCache'] = cache

    const path = cache.path.createSvgPath()

    path.setAttribute('fill', 'none')
    path.setAttribute('stroke-width', cache.thickness.toString())
    path.setAttribute('stroke-linejoin', 'round')

    // Fill for non-selected state
    path.setAttribute('stroke', cache.color)
    path.setAttribute('stroke-opacity', '0.55')

    container.appendChild(path)

    // add the arrows to the container
    super.addArrows(context, container, edge, cache.path, cache.arrows, cache.arrows)
  }

  /**
   * Creates a {@link GeneralPath} from the edge's bends.
   * @param {IEdge} edge The edge to create the path for.
   * @return {GeneralPath} A {@link GeneralPath} following the edge
   * @see Overrides {@link EdgeStyleBase#getPath}
   */
  getPath(edge) {
    // Create a general path from the locations of the ports and the bends of the edge.
    const path = new GeneralPath()
    path.moveTo(edge.sourcePort.location)
    edge.bends.forEach(bend => {
      path.lineTo(bend.location)
    })
    path.lineTo(edge.targetPort.location)
    return path
  }

  /**
   * Determines whether the edge is visible in the given rectangle.
   * Overridden method to improve performance of the suprt implementation
   * @see Overrides {@link EdgeStyleBase#isVisible}
   * @return {boolean}
   */
  isVisible(context, rectangle, edge) {
    // enlarge the test rectangle to include the path thickness
    const enlargedRectangle = rectangle.getEnlarged(this.pathThickness)
    // delegate to the efficient implementation of PolylineEdgeStyle
    return helperEdgeStyle.renderer
      .getVisibilityTestable(edge, helperEdgeStyle)
      .isVisible(context, enlargedRectangle)
  }

  /**
   * This implementation of the look up provides a custom implementation of the
   * {@link ISelectionIndicatorInstaller} interface that better suits to this style.
   * @see Overrides {@link EdgeStyleBase#lookup}
   * @return {Object}
   */
  lookup(edge, type) {
    if (type === ISelectionIndicatorInstaller.$class) {
      return new MySelectionInstaller()
    }

    return super.lookup.call(this, edge, type)
  }
}

const helperEdgeStyle = new PolylineEdgeStyle({
  sourceArrow: IArrow.NONE,
  targetArrow: IArrow.NONE
})

/**
 * This customized {@link EdgeSelectionIndicatorInstaller} overrides the
 * getStroke method to return <code>null</code>, so that no edge path is rendered if the edge is selected.
 */
class MySelectionInstaller extends EdgeSelectionIndicatorInstaller {
  /** @return {Stroke} */
  getStroke(canvas, edge) {
    return null
  }
}
